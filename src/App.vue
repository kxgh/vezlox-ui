<template>
    <div id="app">
        <b-overlay :show="isBusy" rounded="lg">
            <TopBar/>
            <FileItemList/>
        </b-overlay>
    </div>
</template>

<script>
    import FileItemList from './components/FileItemList.vue'
    import {mapActions, mapGetters} from 'vuex'
    import TopBar from "@/components/TopBar";
    import {
        APP_INIT, KEY_PRESS
    } from '@/store/actions.type'

    export default {
        name: 'App',
        methods: {
            ...mapActions([APP_INIT, KEY_PRESS])
        },
        created() {
            this[APP_INIT]();
            window.addEventListener('keydown', (ev) => {
                    this[KEY_PRESS]({
                        key: ev.key.toLowerCase(),
                        event: ev
                    });
                }
            )
        }
        ,
        components: {
            TopBar,
            FileItemList
        },
        computed: {
            ...mapGetters(['isBusy', 'browsed', 'chosenItem'])
        }
        /*watch:{
            isBusy(nv,ov){
                console.log(`isBusy changed! from ${ov} to ${nv}. Is now ${nv? 'busy' : 'free'}`);
            }
        }*/
    }
</script>

<style>
    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    body {
        background-color: #f8f9fa;
    }

    ol.breadcrumb {
        box-shadow: 0 1px 10px rgba(0, 0, 0, 0.49);
    }

    .pill-container {
        display: flex;
    }

    button.rounded-pill {
        box-shadow: 0 2px 4px black;
        margin-right: 1vw;
    }
</style>
