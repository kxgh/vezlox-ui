<template>
    <div id="app">
        <b-overlay :show="isBusy" rounded="lg">
            <TopBar/>
            <ItemList/>
        </b-overlay>
    </div>
</template>

<script>
    import ItemList from './components/ItemList.vue'
    import {mapActions, mapGetters} from 'vuex'
    import TopBar from "@/components/TopBar";

    export default {
        name: 'App',
        methods: {
            ...mapActions(['appInit','keyPress'])
        },
        watch:{

        },
        created() {
            this.appInit();
            window.addEventListener('keydown', (ev) => {
                    this.keyPress({
                        key: ev.key.toLowerCase(),
                        event: ev
                    });
                }
            )
        }
        ,
        components: {
            TopBar,
            ItemList
        },
        computed: {
            browsed: mapGetters(['getBrowsed']).getBrowsed,
            chosenItem: mapGetters(['getChosenItem']).getChosenItem,
            isBusy: mapGetters(['isBusy']).isBusy
        }
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

    #browsedDir {
        font-weight: bold;
        font-family: "Segoe UI", sans-serif;
    }
</style>
