<template>
    <b-list-group>
        <b-list-group-item button v-for="(it,index) in items" :class="{active: it.full == chosenItem.full}"
                           class="fileitem d-flex justify-content-between align-items-center" :data-ext="it.ext"
                           :key="it.full"
                           @click="onChoose({full:it.full,ext:it.ext,focusId:index,name:it.name})"
                           @focus="onFocus(index,$event.target)">
            <span class="fileitem-name">{{it.name}}</span>
            <div class="pill-container" v-show="it.full == chosenItem.full">
                <b-button size="sm" pill variant="success" @click="btnRunClick(it.full, $event)">
                    <b-icon icon="play-fill" variant="light"></b-icon>
                </b-button>
                <b-button size="sm" pill variant="warning" @click="btnCryptClick(it.full, $event)">
                    <b-icon icon="lock-fill" variant="dark"></b-icon>
                </b-button>
                <b-button size="sm" pill variant="danger" @click="btnShredClick(it.full, $event)">
                    <b-icon icon="trash-fill" variant="light"></b-icon>
                </b-button>
            </div>
        </b-list-group-item>

        <b-modal ref="modal-sureShred" hide-footer centered title="Confirm shredding" size="xl"
                 @shown="mdlsOnShown" @hide="mdlsOnHide">
            <div class="d-block text-center">
                <p>Are you sure you want to shred file</p>
                <kbd>{{chosenItem.full}}</kbd>
            </div>
            <b-form-group
                    label="Shred strategy:"
                    description="A strategy to be used for shredding.">
                <b-form-select v-model="shredStrategy" :options="shredStrategyOptions" size="sm" class="mt-2"/>
            </b-form-group>
            <b-form-group label="Choose shred pass count:"
                          description="How many times should the file be shredded">
                <b-form-spinbutton v-model="shredPassCount"/>
            </b-form-group>
            <b-button id="btnMdlsConfirm" class="mt-3" variant="outline-success" block @click="mdlsConfirm()">Shred
            </b-button>
            <b-button class="mt-2" variant="outline-danger" block @click="mdlsHide()">Cancel</b-button>
        </b-modal>

        <b-modal ref="modal-sureCrypt" hide-footer centered title="Confirm crypt" size="xl"
                 @shown="mdlcOnShown" @hide="mdlcOnHide">
            <div class="d-block text-center">
                <p>Are you sure you want to
                    <span v-if="chosenItemEncrypted()"> decrypt </span>
                    <span v-else> encrypt </span>
                    file</p>
                <kbd>{{chosenItem.full}}</kbd>
            </div>
            <b-button id="btnMdlcConfirm" class="mt-3" variant="outline-success" block @click="mdlcConfirm()">Confirm
            </b-button>
            <b-button class="mt-2" variant="outline-danger" block @click="mdlcHide()">Cancel</b-button>
        </b-modal>
    </b-list-group>
</template>

<script>
    import {mapActions, mapGetters} from 'vuex';
    import {KeyBindings, Commands, hasEncExt} from "@/common";
    import {
        ADD_CUSTOM_SYNC_JOB,
        REMOVE_CUSTOM_SYNC_JOB,
        KEY_FREEZE,
        KEY_UNFREEZE,
        NEW_COMMAND
    } from '@/store/actions.type';

    export default {
        name: 'ItemList',
        data() {
            return {
                focusedItemId: -1,
                focusedItemEl: null,
                lastCmd: '',
                lastFocusMap: {},
                shredStrategyOptions: [
                    {
                        label: 'Multi-pass strategies:',
                        options: ['US DOD']
                    }, {
                        label: 'Simple fill strategies:',
                        options: ['Zero bytes', 'FF bytes', 'Random bytes']
                    }
                ],
                shredStrategy: 'US DOD',
                shredPassCount: 1
            }
        },
        methods: {
            ...mapActions([KEY_UNFREEZE, KEY_FREEZE, NEW_COMMAND, ADD_CUSTOM_SYNC_JOB, REMOVE_CUSTOM_SYNC_JOB]),
            chosenItemEncrypted() {
                return hasEncExt(this.chosenItem.name)
            },
            mdls() {
                return this.$refs['modal-sureShred']
            },
            mdlsPrompt() {
                this.mdls().show();
            },
            mdlsHide() {
                this.mdls().hide();
            },
            mdlsOnHide() {
                this[KEY_UNFREEZE]();
            },
            mdlsOnShown() {
                this[KEY_FREEZE]();
                document.getElementById('btnMdlsConfirm').focus()
            },
            mdlsConfirm() {
                this.lastCmd = Commands.shred;
                this[NEW_COMMAND]({
                    type: Commands.shred,
                    target: this.chosenItem.full,
                    strategy: this.shredStrategy,
                    passCount: this.shredPassCount
                });
                this.mdls().hide();
            },

            mdlc() {
                return this.$refs['modal-sureCrypt']
            },
            mdlcPrompt() {
                this.mdlc().show();
            },
            mdlcHide() {
                this.mdlc().hide();
            },
            mdlcOnHide() {
                this[KEY_UNFREEZE]();
            },
            mdlcOnShown() {
                this[KEY_FREEZE]();
                document.getElementById('btnMdlcConfirm').focus()
            },
            mdlcConfirm() {
                this.lastCmd = Commands.crypt;
                this[NEW_COMMAND]({type: Commands.crypt, target: this.chosenItem.full});
                this.mdlc().hide();
            },

            focusSave() {
                this.lastFocusMap[this.browsed] = this.focusedItemId
            },
            focusLoad() {
                return this.lastFocusMap[this.browsed]
            },
            onChoose(arg) {
                arg.type = Commands.choose;
                this[NEW_COMMAND](arg)
            },
            btnRunClick(target, ev) {
                if (ev)
                    ev.stopPropagation();
                this[NEW_COMMAND]({type: Commands.run, target});
            },
            btnCryptClick(target, ev) {
                if (ev)
                    ev.stopPropagation();
                this.mdlcPrompt()
            },
            btnShredClick(target, ev) {
                if (ev)
                    ev.stopPropagation();
                this.mdlsPrompt()
            },
            onFocus(id, el) {
                this.focusedItemId = id;
                this.focusedItemEl = el;
            },
            getFileItemElements() {
                return this.$el.children;
            },
            focusFirst() {
                this.getFileItemElements()[0].focus();
            },
            stepFocus(by) {
                if (!by)
                    return;
                if (this.focusedItemId < 0 || by === 'min') {
                    this.focusFirst();
                    return;
                }
                const lis = this.getFileItemElements();
                let newFocusedItemId = this.focusedItemId + by;
                if (newFocusedItemId < 0 || by === 'max') {
                    lis[lis.length - 1].focus();
                    return;
                }
                if (newFocusedItemId >= lis.length) {
                    lis[0].focus();
                    return;
                }

                const target = lis[newFocusedItemId];
                if (target) {
                    target.focus();
                }
            },
            setFocus(to) {
                const lis = this.getFileItemElements()[to];
                if (lis)
                    lis.focus();
                else this.focusFirst();
            }

        },
        computed: {
            ...mapGetters(['items', 'browsed', 'pressedKey', 'chosenItem', 'isBusy'])
        },
        beforeUpdate() {
            this[ADD_CUSTOM_SYNC_JOB](this.$options.name);
        },
        updated() {
            this[REMOVE_CUSTOM_SYNC_JOB](this.$options.name);
        },
        watch: {
            items() {
                var f = [Commands.back, Commands.shred, Commands.crypt].includes(this.lastCmd) ? () => {
                    const nf = this.focusLoad();
                    this.setFocus(nf ? nf : 0)
                } : () => {
                    this.focusFirst();
                };
                setImmediate(f);
            },
            pressedKey(nv) {
                const k = nv.key;
                this.lastCmd = '';

                this.stepFocus(KeyBindings.getMoveBy(k));

                if (KeyBindings.shred.includes(k) && this.chosenItem.full) {
                    this.focusSave();
                    this.btnShredClick(this.chosenItem.full);
                    return
                }

                if (KeyBindings.crypt.includes(k) && this.chosenItem.full) {
                    this.focusSave();
                    this.btnCryptClick(this.chosenItem.full);
                    return
                }

                if (KeyBindings.forward.includes(k)) {
                    const targ = this.focusedItemEl;
                    if (targ) {
                        // if 'chosen' already chosen item
                        if (this.chosenItem.full == this.items[this.focusedItemId].full) {
                            this.btnRunClick(this.chosenItem.full);
                            return
                        }
                        if (targ.dataset.ext === '/')
                            this.focusSave();
                        targ.click();
                    }
                }
                if (KeyBindings.back.includes(k)) {
                    this.lastCmd = Commands.back;
                    this.getFileItemElements()[0].click();
                }
            }
        }
    }
</script>
<style scoped>
    .fileitem-name {
        font-family: Cairo, Helvetica, Arial, sans-serif;
        font-size: large;
        max-width: 80%;
        word-break: normal;
        overflow: hidden;
        position: relative;
        left: 1rem;
    }

    .fileitem {
        word-break: break-word;
    }

    .fileitem::before {
        content: '';
        position: absolute;
        display: inline-block;
        margin: auto;
        left: .5rem;

        width: 1.5rem;
        height: 1.5rem;
        background-repeat: no-repeat;
        background-position: center;
        background-size: contain;
        background-image: url("/icons/file.png");
    }

    .fileitem[data-ext$='/']::before {
        background-image: url("/icons/folder.png");
    }

    .fileitem[data-ext$='png']::before, .fileitem[data-ext$='jpg']::before, .fileitem[data-ext$='bmp']::before, .fileitem[data-ext$='jpeg']::before, .fileitem[data-ext$='gif']::before {
        background-image: url("/icons/image.png");
    }

    .fileitem[data-ext$='avi']::before, .fileitem[data-ext$='mkv']::before, .fileitem[data-ext$='mp4']::before, .fileitem[data-ext$='wmv']::before {
        background-image: url("/icons/film.png");
    }

    .fileitem[data-ext$='exe']::before, .fileitem[data-ext$='bat']::before {
        background-image: url("/icons/app.png");
    }

    .fileitem[data-ext$='html']::before, .fileitem[data-ext$='htm']::before {
        background-image: url("/icons/web.png");
    }

    .fileitem[data-ext$='xls']::before, .fileitem[data-ext$='ods']::before, .fileitem[data-ext$='xlsx']::before {
        background-image: url("/icons/excel.png");
    }

    .fileitem[data-ext$='pdf']::before {
        background-image: url("/icons/pdf.png");
    }

    .fileitem[data-ext$='ezx']::before {
        background-image: url("/icons/lock.png");
    }

    .fileitem[data-ext$='mp3']::before, .fileitem[data-ext$='wav']::before, .fileitem[data-ext$='m4a']::before, .fileitem[data-ext$='flac']::before {
        background-image: url("/icons/sound.png");
    }

    .fileitem[data-ext$='txt']::before, .fileitem[data-ext$='cfg']::before, .fileitem[data-ext$='srt']::before, .fileitem[data-ext$='rtf']::before, .fileitem[data-ext$='css']::before {
        background-image: url("/icons/text.png");
    }

    .fileitem[data-ext$='7z']::before, .fileitem[data-ext$='gz']::before, .fileitem[data-ext$='jar']::before, .fileitem[data-ext$='zip']::before, .fileitem[data-ext$='rar']::before, .fileitem[data-ext$='tar']::before {
        background-image: url("/icons/archive.png");
    }
</style>
