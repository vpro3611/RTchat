import {reactive} from "vue";
import type {User} from "src/api/types/register_response";


export const SearchStoreUser = reactive({
  items: [] as User[],
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

  setResults(items: User[], cursor: string | null) {
    this.items = items;
    this.nextCursor = cursor;
    this.hasMore = !!cursor;
  },

  appendResults(items: User[], cursor: string | null) {
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
