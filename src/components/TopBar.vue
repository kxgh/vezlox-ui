<template>
    <b-breadcrumb class="d-flex justify-content-between align-items-center">
        <b-breadcrumb-item v-bind:active="false">
            <span id="browsedDir" @click="mdlgPrompt">{{browsed}}</span>
        </b-breadcrumb-item>
        <div class="pill-container">
            <b-button id="btnSetDef" size="sm" pill variant="light" @click="btnSetDefClick">
                <b-icon icon="house-fill" variant="dark"></b-icon>
            </b-button>
            <b-button id="btnExplore" size="sm" pill variant="light" @click="btnExploreClick">
                <b-icon icon="folder-symlink" variant="dark"></b-icon>
            </b-button>
            <b-button id="btnGoto" size="sm" pill variant="light" @click="btnGotoClick()">
                <b-icon icon="reply-fill" variant="dark"></b-icon>
            </b-button>
            <b-button id="btnRefresh" size="sm" pill variant="light" @click="btnRefreshClick">
                <b-icon icon="arrow-repeat" variant="dark"></b-icon>
            </b-button>
            <b-button id="btnPhrase" size="sm" pill variant="light" @click="btnPhraseClick">
                <b-icon icon="shield-lock-fill" variant="dark"></b-icon>
            </b-button>
        </div>

        <b-modal ref="modal-setdef" hide-footer centered title="Set new default start directory" size="xl"
                 @shown="mdldOnShown"
                 @hide="mdldOnHide">
            <div class="d-block text-center">
                <b-input-group size="lg" prepend="Default directory">
                    <b-form-input autocomplete="off" placeholder="Dir path" v-on:keypress.enter="mdldConfirm()"
                                  autofocus
                                  v-model="mdldInput" @focus="$event.target.select()"/>
                </b-input-group>
            </div>
            <b-button class="mt-3" variant="outline-success" block @click="mdldConfirm()">Confirm</b-button>
            <b-button class="mt-2" variant="outline-danger" block @click="mdldHide()">Close</b-button>
        </b-modal>
        <b-modal ref="modal-goto" hide-footer centered title="Go to directory" size="xl" @shown="mdlgOnShown"
                 @hide="mdlgOnHide">
            <div class="d-block text-center">
                <b-input-group size="lg" prepend="Go to">
                    <b-form-input autocomplete="off" placeholder="Directory path" v-on:keypress.enter="mdlgConfirm()"
                                  autofocus
                                  v-model="mdlgInput" @focus="$event.target.select()"/>
                </b-input-group>
            </div>
            <b-button class="mt-3" variant="outline-success" block @click="mdlgConfirm()">Go</b-button>
            <b-button class="mt-2" variant="outline-danger" block @click="mdlgHide()">Close</b-button>
        </b-modal>
        <b-modal ref="modal-phrase" hide-footer title="Phrase" @shown="mdlpOnShown"
                 @hide="mdlpOnHide">
            <div class="d-block text-center">
                <b-input-group prepend="Enter phrase:">
                    <b-form-input autocomplete="off" placeholder="Phrase" v-on:keypress.enter="mdlpHide" autofocus
                                  v-model="localPhrase" @focus="$event.target.select()"/>
                </b-input-group>
            </div>
        </b-modal>

        <b-tooltip target="btnSetDef" triggers="hover" placement="bottom" noninteractive>
            Set home folder
        </b-tooltip>
        <b-tooltip target="btnExplore" triggers="hover" placement="bottom" noninteractive>
            Open directory in explorer {{getHotKey('e')}}
        </b-tooltip>
        <b-tooltip target="btnGoto" triggers="hover" placement="bottom" noninteractive>
            Jump to directory {{getHotKey('g')}}
        </b-tooltip>
        <b-tooltip target="btnRefresh" triggers="hover" placement="bottom" noninteractive>
            Refresh directory contents {{getHotKey('r')}}
        </b-tooltip>
        <b-tooltip target="btnPhrase" triggers="hover" placement="bottom" noninteractive>
            Enter passphrase {{getHotKey('p')}}
        </b-tooltip>
    </b-breadcrumb>
</template>

<script>
    import {mapGetters, mapActions} from "vuex";
    import {KeyBindings, Commands} from "@/common";

    export default {
        name: "TopBar",
        computed: {
            browsed: mapGetters(['getBrowsed']).getBrowsed,
            isBusy: mapGetters(['isBusy']).isBusy,
            keyPress: mapGetters(['getKeyPress']).getKeyPress,
            error: mapGetters(['getError']).getError
        },
        data() {
            return {
                mdlgInput: '',
                mdldInput: '',
                localPhrase: '00_sOmEdEfAulTphraseeeeee!!'
            }
        },
        methods: {
            ...mapActions(['keyFreeze', 'keyUnfreeze', 'newCommand']),
            getHotKey(target) {
                switch (target) {
                    case 'e':
                        return `[${KeyBindings.explore[0].toUpperCase()}]`
                    case 'p':
                        return `[${KeyBindings.phrase[0].toUpperCase()}]`
                    case 'g':
                        return `[${KeyBindings.goto[0].toUpperCase()}]`
                    case 'r':
                        return `[${KeyBindings.refresh[0].toUpperCase()}]`
                    default:
                        return ''
                }
            },
            mdld() {
                return this.$refs['modal-setdef']
            },
            mdldPrompt() {
                this.mdldInput = this.browsed;
                //console.log(this.$options.name)
                this.mdld().show();
            },
            mdldHide() {
                this.mdld().hide();
            },
            mdldOnHide() {
                this.keyUnfreeze();
            },
            mdldOnShown() {
                this.keyFreeze();
            },
            mdldConfirm() {
                if (this.mdldInput)
                    this.newCommand({type: Commands.setdef, target: this.mdldInput});
                this.mdld().hide()
            },

            mdlg() {
                return this.$refs['modal-goto']
            },
            mdlgPrompt() {
                this.mdlgInput = this.browsed;
                //console.log(this.$options.name)
                this.mdlg().show();
            },
            mdlgHide() {
                this.mdlg().hide();
            },
            mdlgOnHide() {
                this.keyUnfreeze();
            },
            mdlgOnShown() {
                this.keyFreeze();
            },
            mdlgConfirm() {
                if (this.mdlgInput)
                    this.newCommand({type: Commands.browse, full: this.mdlgInput});
                this.mdlg().hide()
            },

            mdlp() {
                return this.$refs['modal-phrase']
            },
            mdlpPrompt() {
                this.mdlp().show();
            },
            mdlpHide() {
                this.mdlp().hide();
            },
            mdlpOnHide() {
                this.$store.commit('setPhrase', this.localPhrase);
                this.keyUnfreeze();
            },
            mdlpOnShown() {
                this.keyFreeze();
            },
            btnSetDefClick() {
                this.mdldPrompt();
            },
            btnExploreClick() {
                this.newCommand({type: Commands.explore});
            },
            btnGotoClick() {
                this.mdlgPrompt();
            },
            btnRefreshClick() {
                this.newCommand({type: Commands.browse, target: this.browsed});
            },
            btnPhraseClick() {
                this.mdlpPrompt()
            }
        },
        watch: {
            keyPress({key}) {
                if (KeyBindings.goto.includes(key)) {
                    this.mdlgPrompt()
                } else if (KeyBindings.explore.includes(key)) {
                    this.btnExploreClick()
                } else if (KeyBindings.refresh.includes(key)) {
                    this.btnRefreshClick()
                } else if (KeyBindings.phrase.includes(key)) {
                    this.btnPhraseClick()
                }
            },
            error(nv) {
                this.$bvToast.toast(nv.msg, {
                    title: `Error`,
                    variant: 'danger'
                })

            }
        }
    }
</script>

<style>
</style>