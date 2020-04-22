import Vue from 'vue'
import Vuex from 'vuex'
import {KeyBindings, Commands, hasEncExt, getPin, WS} from "@/common";
import {
    ADD_CUSTOM_SYNC_JOB,
    REMOVE_CUSTOM_SYNC_JOB,
    KEY_FREEZE,
    KEY_UNFREEZE,
    KEY_PRESS,
    NEW_COMMAND, APP_INIT
} from './actions.type'
import * as MUTS from './mutations.type';
import {SET_ITEMS} from "./mutations.type";

Vue.use(Vuex);

const synGen = (() => {
    let sid = 1;
    return () => sid++
})();

export default new Vuex.Store({
    getters: {
        items: state => state.items,
        browsed: state => state.browsed,
        chosenItem: state => state.chosenItem,
        pressedKey: state => state.pressedKey,
        isBusy: state => !!state.syncList.length,
        error: state => state.error
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
        async [KEY_PRESS]({commit, state, getters}, {key, event}) {
            if (!state.keysFrozen && !getters.isBusy) {
                if (KeyBindings.any.has(key)) {
                    event.preventDefault();
                    commit(MUTS.SET_KEY, key);
                } else {
                    console.debug('Unknown key binding:', key)
                }
            }
        },
        async [KEY_FREEZE]({commit, state}) {
            if (state.keysFrozen) {
                console.warn('Attempted to freeze keys while already frozen!')
            } else {
                commit(MUTS.SET_KEY_FREEZE, true);
            }
        },
        async [KEY_UNFREEZE]({commit, state}) {
            if (state.keysFrozen) {
                commit(MUTS.SET_KEY_FREEZE, false);
            } else {
                console.warn('Attempted to unfreeze keys when not frozen!');
            }
        },
        async [ADD_CUSTOM_SYNC_JOB]({commit}, customJobId) {
            commit(MUTS.ADD_SYNC_JOB, customJobId);
        },
        async [REMOVE_CUSTOM_SYNC_JOB]({commit}, customJobId) {
            commit(MUTS.REMOVE_SYNC_JOB, customJobId);
        },
        async [NEW_COMMAND]({commit, getters}, cmd) {
            if (!getters.isBusy) {
                if (cmd.type === Commands.choose) {
                    if (cmd.ext === '/') {
                        cmd.type = Commands.browse;
                    } else {
                        commit(MUTS.MARK_CHOSEN, {full: cmd.full, name: cmd.name});
                    }
                }
                if (cmd.type === Commands.explore) {
                    this.dispatch('_askFor', {type: cmd.type, target: getters.getBrowsed});
                }
                if (cmd.type === Commands.browse) {
                    commit(MUTS.SET_LAST_FOCUS_ID, cmd.focusId ? cmd.focusId : 0);
                    this.dispatch('_askFor', {type: cmd.type, target: cmd.full || cmd.target});
                }
                if ([Commands.run, Commands.shred, Commands.crypt, Commands.setdef].includes(cmd.type))
                    this.dispatch('_askFor', cmd);
            }
        },
        async _askFor({state, commit}, cmd) {
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
                    o.sid = synGen();
                    commit(MUTS.ADD_SYNC_JOB, o.sid);
                    break;
            }
            WS.send(o);
        },
        async _onMsg({commit}, msg) {
            if (msg.type === Commands.browse) {
                this.dispatch(ADD_CUSTOM_SYNC_JOB, SET_ITEMS);
                //state.syncList.push(SET_ITEMS);
                setImmediate(() => {
                    commit(MUTS.SET_ITEMS, msg.browse);
                    commit(MUTS.SET_BROWSED, msg.target);
                })
            } else if (msg.type === 'error') {
                commit(MUTS.SET_ERROR, msg.error);
                console.error(msg.error);
            }
            if (msg.sid)
                commit(MUTS.REMOVE_SYNC_JOB, msg.sid);

        },
        async [APP_INIT]() {
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
        [MUTS.SET_ITEMS](state, items) {
            setImmediate(() => {
                state.items = items;
                state.syncList = state.syncList.filter(j => j != SET_ITEMS)
            });
        },
        [MUTS.SET_BROWSED](state, browsed) {
            state.chosenItem = {
                full: null,
                name: null
            };
            state.browsed = browsed;
        },
        [MUTS.MARK_CHOSEN](state, {full, name}) {
            state.chosenItem = {
                full,
                name
            };
        },
        [MUTS.SET_LAST_FOCUS_ID](state, focusId) {
            state.lastFocusId = focusId;
        },
        [MUTS.ADD_SYNC_JOB](state, sid) {
            state.syncList.push(sid);
        },
        [MUTS.REMOVE_SYNC_JOB](state, sid) {
            state.syncList = state.syncList.filter(j => j != sid);
        },
        [MUTS.SET_KEY](state, key) {
            state.pressedKey = {
                time: Date.now(),
                key
            };
        },
        [MUTS.SET_KEY_FREEZE](state, f) {
            state.keysFrozen = f;
        },
        [MUTS.SET_ERROR](state, errMsg) {
            state.error = {
                msg: errMsg,
                time: Date.now()
            }
        },
        [MUTS.SET_PHRASE](state, phr) {
            state.phrase = phr;
        }
    },
    modules: {}
})