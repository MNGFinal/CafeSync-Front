// redux/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUserChatRooms } from "../apis/chat/chatApi";

// Thunk 액션: 새로운 메시지(newMsg)를 받아서 채팅방 목록 업데이트
export const updateChatRooms = createAsyncThunk(
  "chat/updateChatRooms",
  async (newMsg, { getState }) => {
    const chatRooms = getState().chat.chatRooms;
    let updatedChatRooms = [...chatRooms];

    const roomIndex = updatedChatRooms.findIndex(
      (room) => room.roomId === newMsg.roomId
    );

    // newMsg.sendTime이 "YY.MM.DD HH:mm:ss" 형식이라면,
    // moment를 이용하여 "YYYY-MM-DD HH:mm:ss"로 변환
    const updatedTime = newMsg.sendTime
      ? require("moment")(newMsg.sendTime, "YY.MM.DD HH:mm:ss").format(
          "YYYY-MM-DD HH:mm:ss"
        )
      : require("moment")().format("YYYY-MM-DD HH:mm:ss");

    if (roomIndex !== -1) {
      updatedChatRooms[roomIndex] = {
        ...updatedChatRooms[roomIndex],
        lastMessage: newMsg.message,
        lastMessageTime: updatedTime,
      };
      // 최신 메시지를 받은 방을 맨 앞으로 이동
      const [movedRoom] = updatedChatRooms.splice(roomIndex, 1);
      updatedChatRooms.unshift(movedRoom);
    }
    return updatedChatRooms;
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chatRooms: [],
    selectedRoom: null,
    messages: {},
  },
  reducers: {
    setChatRooms: (state, action) => {
      state.chatRooms = action.payload;
    },
    setSelectedRoom: (state, action) => {
      state.selectedRoom = action.payload;
    },
    setMessages: (state, action) => {
      const { roomId, messages } = action.payload;
      if (!roomId) return;
      state.messages[roomId] = messages || [];
    },
    addMessage: (state, action) => {
      const { roomId, message } = action.payload;
      if (!roomId) return;
      if (!Array.isArray(state.messages[roomId])) {
        state.messages[roomId] = [];
      }
      state.messages[roomId].push(message);
    },
    // updateChatRoomLastMessage 액션 추가
    updateChatRoomLastMessage: (state, action) => {
      const { roomId, lastMessage, lastMessageTime } = action.payload;
      const index = state.chatRooms.findIndex((room) => room.roomId === roomId);
      if (index !== -1) {
        state.chatRooms[index] = {
          ...state.chatRooms[index],
          lastMessage,
          lastMessageTime,
        };
        // 최신 메시지가 있는 방을 맨 앞으로 이동
        const [updatedRoom] = state.chatRooms.splice(index, 1);
        state.chatRooms.unshift(updatedRoom);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateChatRooms.fulfilled, (state, action) => {
      state.chatRooms = action.payload;
    });
  },
});

export const {
  setChatRooms,
  setSelectedRoom,
  setMessages,
  addMessage,
  updateChatRoomLastMessage, // export 추가
} = chatSlice.actions;

export default chatSlice.reducer;
