<template>
    <b-list-group-item button

                       class="fileitem d-flex justify-content-between align-items-center"
                       :class="{active: this.chosenItem.full === this.fileFull}"
                       @focus="onFocus"
                       @click="onClick">

        <span class="fileitem-name">
            <slot/>
        </span>
        <TriplePill v-show="this.fileFull === this.chosenItem.full"
                    :on-run-click="onRunClick"
                    :on-crypt-click="onCryptClick"
                    :on-shred-click="onShredClick"
                    :full-path="fileFull"/>
    </b-list-group-item>
</template>

<script>
    import {mapGetters} from "vuex";
    import TriplePill from "@/components/TriplePill";

    export default {
        name: "FileItem",
        components: {TriplePill},
        props: {
            onRunClick: Function,
            onCryptClick: Function,
            onShredClick: Function,
            onFocus: Function,
            onClick: Function,
            fileName: String,
            fileFull: String
        },
        methods: {
            focus() {
                this.$el.focus();
            },
            click() {
                this.$el.click()
            }
        },
        computed: {
            ...mapGetters(['chosenItem'])
        }
    }
</script>

<style>
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

    .fileitem[data-ext$='avi']::before, .fileitem[data-ext$='flv']::before, .fileitem[data-ext$='mkv']::before, .fileitem[data-ext$='mp4']::before, .fileitem[data-ext$='wmv']::before {
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

    .fileitem[data-ext$='7z']::before, .fileitem[data-ext$='apk']::before, .fileitem[data-ext$='gz']::before, .fileitem[data-ext$='jar']::before, .fileitem[data-ext$='zip']::before, .fileitem[data-ext$='rar']::before, .fileitem[data-ext$='tar']::before {
        background-image: url("/icons/archive.png");
    }
</style>