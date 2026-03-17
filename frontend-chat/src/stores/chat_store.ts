import {reactive} from "vue";
import {CreateGroupChatResponse} from "src/api/types/create_group_chat_response";


export const ChatStore = reactive({
  chats: [] as CreateGroupChatResponse[],
  isBootstrapping: true,

  setChat(chats: CreateGroupChatResponse[]) {
    this.chats = chats;
  },

  addChat(chat: CreateGroupChatResponse) {
    this.chats.unshift(chat);
  },

  bumpChat(chatId: string) {
    const index = this.chats.findIndex(c => c.id === chatId);
    if (index === -1) return;

    const [chat] = this.chats.splice(index, 1);
    if (chat) {
      this.chats.unshift(chat);
    }
  },

  removeChat(chatId: string) {
    const index = this.chats.findIndex(c => c.id === chatId);
    if (index !== -1) {
      this.chats.splice(index, 1);
    }
  },

  finishBootstrapping() {
    this.isBootstrapping = false;
  }

})
