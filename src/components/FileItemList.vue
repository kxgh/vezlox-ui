<template>
    <b-list-group>
        <div ref="fileitems-container">
            <FileItem button v-for="(it,index) in items"
                      :key="it.full" :data-ext="it.ext"
                      :on-run-click="btnRunClick"
                      :on-crypt-click="btnCryptClick"
                      :on-shred-click="btnShredClick"
                      :on-focus="()=>onFocus(index)"
                      :on-click="()=>onChoose({full:it.full,ext:it.ext,focusId:index,name:it.name})"
                      :file-full="it.full"
                      :file-name="it.name">
                {{it.name}}
            </FileItem>
        </div>

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
            <b-button ref="btnMdlsConfirm" class="mt-3" variant="outline-success" block @click="mdlsConfirm()">Shred
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
            <b-button ref="btnMdlcConfirm" class="mt-3" variant="outline-success" block @click="mdlcConfirm()">Confirm
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
    import FileItem from "@/components/FileItem";

    export default {
        name: 'FileItemList',
        components: {FileItem},
        data() {
            return {
                focusedItemId: -1,
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
                this.$refs.btnMdlsConfirm.focus();
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
                this.$refs.btnMdlcConfirm.focus()
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
                return parseInt(this.lastFocusMap[this.browsed])
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
            onFocus(id) {
                this.focusedItemId = id;
            },
            getFileItemElements() {
                return this.$refs['fileitems-container'].children;
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
                    const targ = this.getFileItemElements()[this.focusedItemId];
                    if (targ) {
                        // if 'chosen' already chosen item
                        if (this.chosenItem.full === this.items[this.focusedItemId].full) {
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
<style>

</style>
