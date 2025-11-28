
// Utility to simulate a basic file system for containers

export const createFileSystem = (imageName = 'ubuntu') => {
    const fs = {
        '/': { type: 'dir', children: ['bin', 'etc', 'home', 'root', 'tmp', 'usr', 'var'] },
        '/bin': { type: 'dir', children: ['bash', 'ls', 'cat', 'ps', 'mkdir', 'touch', 'sh', 'cp', 'mv', 'rm'] },
        '/etc': { type: 'dir', children: ['hostname', 'hosts', 'resolv.conf'] },
        '/home': { type: 'dir', children: [] },
        '/root': { type: 'dir', children: ['.bashrc', '.profile'] },
        '/tmp': { type: 'dir', children: [] },
        '/usr': { type: 'dir', children: ['bin', 'lib', 'local'] },
        '/usr/bin': { type: 'dir', children: [] },
        '/var': { type: 'dir', children: ['log', 'www'] },
        '/var/www': { type: 'dir', children: ['html'] },
        '/var/www/html': { type: 'dir', children: ['index.html'] },
        // Files content mock
        'file_contents': {
            '/etc/hostname': 'container-id',
            '/etc/hosts': '127.0.0.1 localhost',
            '/var/www/html/index.html': '<html><body><h1>Hello World</h1></body></html>',
            '/root/.bashrc': '# .bashrc',
        }
    };

    // Add specific binaries based on image
    if (imageName.includes('nginx')) {
        fs['/usr/bin'].children.push('nginx');
    } else if (imageName.includes('redis')) {
        fs['/usr/bin'].children.push('redis-cli');
        fs['/usr/bin'].children.push('redis-server');
    } else if (imageName.includes('node')) {
        fs['/usr/bin'].children.push('node');
        fs['/usr/bin'].children.push('npm');
    } else if (imageName.includes('postgres')) {
        fs['/usr/bin'].children.push('psql');
        fs['/usr/bin'].children.push('postgres');
    } else if (imageName.includes('python')) {
        fs['/usr/bin'].children.push('python');
        fs['/usr/bin'].children.push('pip');
    }

    return fs;
};

export const fsLs = (fs, cwd, flags = '') => {
    // Normalize cwd
    const path = cwd.endsWith('/') && cwd.length > 1 ? cwd.slice(0, -1) : cwd;

    if (fs[path] && fs[path].type === 'dir') {
        const files = fs[path].children.sort();

        if (flags.includes('l')) {
            // Mock ls -l output
            return files.map(f => {
                const isDir = fs[`${path === '/' ? '' : path}/${f}`]?.type === 'dir' ||
                    (fs['/bin'].children.includes(f) && path === '/bin') || // Hack for bin items not fully in fs map
                    false;
                // Actually, for simplicity, let's just mock permissions
                const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                const size = Math.floor(Math.random() * 10000);
                const date = new Date().toDateString().slice(4, 10); // e.g., "Nov 28"
                const time = '12:00';
                return `${perms} 1 root root ${size.toString().padStart(5)} ${date} ${time} ${f}`;
            }).join('\n');
        }

        return files.join('  ');
    }
    return `ls: cannot access '${path}': No such file or directory`;
};

export const fsCd = (fs, cwd, target) => {
    if (!target || target === '~') return '/root';
    if (target === '/') return '/';
    if (target === '..') {
        if (cwd === '/') return '/';
        const parts = cwd.split('/');
        parts.pop();
        return parts.length === 1 ? '/' : parts.join('/');
    }

    // Handle relative path
    let newPath;
    if (target.startsWith('/')) {
        newPath = target;
    } else {
        newPath = cwd === '/' ? `/${target}` : `${cwd}/${target}`;
    }

    // Normalize (remove trailing slash if not root)
    if (newPath.length > 1 && newPath.endsWith('/')) {
        newPath = newPath.slice(0, -1);
    }

    if (fs[newPath] && fs[newPath].type === 'dir') {
        return newPath;
    }
    return null; // Error indicator
};

export const fsTouch = (fs, cwd, filename) => {
    const path = cwd === '/' ? `/${filename}` : `${cwd}/${filename}`;
    if (fs[path]) return fs; // Already exists, update timestamp (mock: do nothing)

    // Check if parent exists
    if (!fs[cwd]) return fs;

    // Add to parent children
    if (!fs[cwd].children.includes(filename)) {
        fs[cwd].children.push(filename);
    }

    // Create file entry
    fs[path] = { type: 'file' };
    return { ...fs }; // Return new reference to trigger update
};

export const fsMkdir = (fs, cwd, dirname) => {
    const path = cwd === '/' ? `/${dirname}` : `${cwd}/${dirname}`;
    if (fs[path]) return fs; // Already exists

    if (!fs[cwd]) return fs;

    if (!fs[cwd].children.includes(dirname)) {
        fs[cwd].children.push(dirname);
    }

    fs[path] = { type: 'dir', children: [] };
    return { ...fs };
};

export const fsCat = (fs, cwd, filename) => {
    const path = cwd === '/' ? `/${filename}` : `${cwd}/${filename}`;

    if (fs['file_contents'] && fs['file_contents'][path]) {
        return fs['file_contents'][path];
    }

    if (fs[path] && fs[path].type === 'dir') {
        return `cat: ${filename}: Is a directory`;
    }

    if (fs[path]) {
        return ''; // Empty file
    }

    return `cat: ${filename}: No such file or directory`;
};

export const fsPwd = (cwd) => {
    return cwd;
};
