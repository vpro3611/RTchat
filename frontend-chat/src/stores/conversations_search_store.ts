import {reactive} from "vue";
import type {CreateGroupChatResponse} from "src/api/types/create_group_chat_response";


export const SearchStore = reactive({
  items: [] as CreateGroupChatResponse[],
  isLoading: false,
  query: "",
  nextCursor: null as string | null,
  hasMore: true,

  setQuery(query: string) {
    this.query = query;
    this.items = [];
    this.nextCursor = null;
    this.hasMore = true;
  },

  setResults (items: CreateGroupChatResponse[], cursor: string | null) {
    this.items = items;
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  appendResults (items: CreateGroupChatResponse[], cursor: string | null) {
    this.items.push(...items);
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  setLoading(val: boolean) {
    this.isLoading = val;
  },

  clear() {
    this.query = "";
    this.items = [];
    this.nextCursor = null;
    this.hasMore = true;
    this.isLoading = false;
  }

})

