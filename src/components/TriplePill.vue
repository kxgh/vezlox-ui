<template>
    <div class="pill-container">
        <b-button size="sm" pill variant="success" @click="onRunClick(fullPath,$event)">
            <b-icon icon="play-fill" variant="light"></b-icon>
        </b-button>
        <b-button size="sm" pill variant="warning" @click="onCryptClick(fullPath,$event)">
            <b-icon icon="lock-fill" variant="dark"></b-icon>
        </b-button>
        <b-button size="sm" pill variant="danger" @click="onShredClick(fullPath,$event)">
            <b-icon icon="trash-fill" variant="light"></b-icon>
        </b-button>
    </div>
</template>

<script>
    export default {
        name: "TriplePill",
        props: {
            onRunClick: Function,
            onCryptClick: Function,
            onShredClick: Function,
            fullPath: String
        }
    }
</script>

<style>
    .pill-container {
        display: flex;
    }
</style>