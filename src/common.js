const KeyBindings = {
    forward: ['d', 'arrowright', 'enter'],
    back: ['a', 'backspace', 'arrowleft'],
    move: ['w', 's', 'arrowup', 'arrowdown', 'home', 'end', 'pageup', 'pagedown'],
    disabled: ['tab', 'spacebar'],
    goto: ['g'],
    explore: ['e'],
    refresh: ['f'],
    phrase: ['p'],
    shred: ['x'],
    crypt: ['c'],
    getMoveBy(k) {
        if (k === 'w' || k === 'arrowup')
            return -1;
        if (k === 's' || k === 'arrowdown')
            return 1;
        if (k === 'pageup')
            return -5;
        if (k === 'pagedown')
            return 5;
        if (k === 'home')
            return 'min';
        if (k === 'end')
            return 'max';
    }
};
KeyBindings.any = new Set([].concat.apply([], Object.values(KeyBindings).filter(v => Array.isArray(v))));

const Commands = {
    choose: 'choose',
    browse: 'browse',
    explore: 'explore',
    back: 'back',
    run: 'run',
    crypt: 'crypt',
    shred: 'shred',
    setdef: 'setstartdir'
};

const hasEncExt = p => {
    return p ? p.toLowerCase().endsWith('.ezx') : false;
};

const getPin = ()=> `vezloxpindefault123vezloxpin`;

export {KeyBindings, Commands, hasEncExt, getPin};