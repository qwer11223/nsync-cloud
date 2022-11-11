import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    fileList: [], //文件列表渲染 ()
    uploadList: [   //上传文件列表  1.@/api/upload(w)  2.@/layout/index.vue(r)
      /*
      {
        name: files[i].name,
        size: files[i].size,
        progress: 0,
        chunkTotal: 0,
        currentChunk: 0,
        state: pending / success
      }
       */
    ],
    deviceLsit: [],  //在线设备列表 1.@/views/device(r)
    showUploadList: 0,  //展开上传列表
    user: 'admin',
    layout: 1, //布局 list / grid
    usage_disk: 0,
    total_disk: 0,
    progress: 20,
    change: 0,
    version: '', // electron/browser
    syncPath: ''
  },
  mutations: {
    changeFileList: function (state) {
      state.change = !state.change
    },
    setUploadList: function (state, file) { //添加上传列表
      state.uploadList.push(file)
      //console.log(state.uploadList)
    },
    // changeUploadList: function (state, index, key, value) {
    //   state.uploadList[index][key] = value
    // },
    toggleUploadList: function (state) {
      state.showUploadList = !state.showUploadList
    },
    showUpload: function (state) {
      state.showUploadList = 1
    },
    setProgress: function (state, num) {
      state.progress = num
    }
  },
  getters: {
    getChange: state => {
      return state.change
    },
    getUser: state => {
      return state.user
    },
    getUploadList: state => {
      return state.uploadList
    },
    getProcess: state => {
      return state.progress
    },
    getDevice: state => {
      return state.deviceLsit
    },
    getFileList: state => {
      return state.fileList
    }
  },
  actions: {
  },
  modules: {
  }
})
