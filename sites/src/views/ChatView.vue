<template>
    <div>
        <h1>Chat</h1>
        <p>Chat with a HomeTek representative</p>
        <Chat />
    </div>
</template>

<script>
import Chat from '@/components/Chat.vue'

export default {
    name: 'ChatView',
    components: {
        Chat
    }
}
</script>