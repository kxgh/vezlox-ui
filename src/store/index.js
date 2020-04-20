import Vue from 'vue'
import Vuex from 'vuex'
import {KeyBindings, Commands, hasEncExt, getPin, WS} from "@/common";

const genSyncId = (function () {
    let sid = 1;
    return () => sid++
})();

Vue.use(Vuex);

export default new Vuex.Store({
    getters: {
        getItems: state => state.items,
        getBrowsed: state => state.browsed,
        getChosenItem: state => state.chosenItem,
        getPressedKey: state => state.pressedKey,
        isBusy: state => state.syncList.length > 0,
        getError: state => state.error
    },
    state: {
        browsed: 'No connection',
        items: [{full: 'sampleFullPath', name: 'NO CONNECTION', ext: '.smp'}],
        lastFocusId: 0,

        syncList: [],

        chosenItem: {
            full: null,
            name: null
        },
        pressedKey: {
            time: null,
            key: null,
        },
        keysFrozen: false,
        error: {
            time: null,
            msg: null
        },
        phrase: '00_sOmEdEfAulTphraseeeeee!!'
    },
    actions: {
        async keyPress({commit, state, getters}, {key, event}) {
            if (!state.keysFrozen && !getters.isBusy) {
                if (KeyBindings.any.has(key)) {
                    event.preventDefault();
                    commit('setKey', key);
                } else {
                    console.debug('Unknown key binding:', key)
                }
            }
        },
        async keyFreeze({commit, state}) {
            if (state.keysFrozen) {
                console.warn('Attempted to freeze keys while already frozen!')
            } else {
                commit('keyFreeze');
            }
        },
        async keyUnfreeze({commit, state}) {
            if (state.keysFrozen) {
                commit('keyUnfreeze');
            } else {
                console.warn('Attempted to unfreeze keys when not frozen!');
            }
        },
        async newCommand({commit, getters}, cmd) {
            if (!getters.isBusy) {
                if (cmd.type === Commands.choose) {
                    if (cmd.ext === '/') {
                        cmd.type = Commands.browse;
                    } else {
                        commit('markChosen', {full: cmd.full, name: cmd.name});
                    }
                }
                if (cmd.type === Commands.explore) {
                    this.dispatch('_askFor', {type: cmd.type, target: getters.getBrowsed});
                }
                if (cmd.type === Commands.browse) {
                    commit('setLastFocusId', cmd.focusId ? cmd.focusId : 0);
                    this.dispatch('_askFor', {type: cmd.type, target: cmd.full || cmd.target});
                }
                if ([Commands.run, Commands.shred, Commands.crypt, Commands.setdef].includes(cmd.type))
                    this.dispatch('_askFor', cmd);
            }
        },
        async _askFor({commit, state}, cmd) {
            const o = {
                type: cmd.type,
                pin: getPin()
            };
            Object.assign(o, cmd);
            switch (o.type) {
                case Commands.crypt:
                    o.type = hasEncExt(o.target) ? 'decrypt' : 'encrypt';
                    o.phrase = state.phrase;
                // eslint-disable-next-line no-fallthrough
                case Commands.browse:
                case Commands.shred:
                    o.sid = genSyncId();
                    commit('addSyncJob', o.sid);
                    break;
            }
            WS.send(o);
        },
        async _onMsg({commit}, msg) {
            if (msg.type === Commands.browse) {
                commit('setItems', msg.browse);
                commit('setBrowsed', msg.target);
            } else if (msg.type === 'error') {
                commit('setError', msg.error);
                console.error(msg.error);
            }
            if (msg.sid)
                commit('removeSyncJob', msg.sid);
        },
        async appInit() {
            const conn = WS.getConnection();
            conn.onopen = () => {
                console.log(`Opened ws`)
            };
            conn.onmessage = msg => {
                this.dispatch('_onMsg', JSON.parse(msg.data))
            };
        }
    },
    mutations: {
        setItems(state, items) {
            state.items = items;
        },
        setBrowsed(state, browsed) {
            state.chosenItem = {
                full: null,
                name: null
            };
            state.browsed = browsed;
        },
        markChosen(state, {full, name}) {
            state.chosenItem = {
                full,
                name
            };
        },
        setLastFocusId(state, focusId) {
            state.lastFocusId = focusId;
        },
        addSyncJob(state, sid) {
            state.syncList.push(sid);
        },
        removeSyncJob(state, sid) {
            if (!isNaN(sid))
                state.syncList = state.syncList.filter(j => j != sid);
        },
        setKey(state, key) {
            state.pressedKey = {
                time: Date.now(),
                key
            };
        },
        keyFreeze(state) {
            state.keysFrozen = true;
        },
        keyUnfreeze(state) {
            state.keysFrozen = false;
        },
        setError(state, errMsg) {
            state.error = {
                msg: errMsg,
                time: Date.now()
            }
        },
        setPhrase(state, phr) {
            state.phrase = phr;
        }
    },
    modules: {}
})