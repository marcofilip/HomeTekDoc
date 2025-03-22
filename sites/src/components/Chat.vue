<template>
  <div class="chat-container">
    <div class="user-count">Users online: {{ userCount }}</div>
    <div class="messages" ref="messageContainer">
      <div v-for="(msg, index) in messages" :key="index" class="message">
        <strong>{{ msg.username }}:</strong> {{ msg.text }}
        <small>{{ new Date(msg.timestamp).toLocaleTimeString() }}</small>
      </div>
    </div>
    <div class="input-area">
      <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'ChatVue',
  data() {
    return {
      socket: null,
      messages: [],
      newMessage: '',
      userCount: 0,
      username: 'User_' + Math.floor(Math.random() * 1000)
    };
  },
  mounted() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('chat message', (msg) => {
      this.messages.push(msg);
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    });

    this.socket.on('userCount', (count) => {
      this.userCount = count;
    });
  },
  methods: {
    sendMessage() {
      if (this.newMessage.trim()) {
        this.socket.emit('chat message', {
          text: this.newMessage,
          username: this.username
        });
        this.newMessage = '';
      }
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer;
      container.scrollTop = container.scrollHeight;
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
};
</script>

<style scoped>
.chat-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.messages {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}

.message {
  margin-bottom: 10px;
}

.input-area {
  display: flex;
  gap: 10px;
}

input {
  flex: 1;
  padding: 8px;
}

button {
  padding: 8px 16px;
}
</style>
