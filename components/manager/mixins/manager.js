// Event bus
import EventBus from './../../../plugins/eventBus';

export default {
  computed: {
    /**
     * Selected disk for this manager
     * @returns {default.computed.selectedDisk|(function())|default.selectedDisk|null}
     */
    selectedDisk() {
      return this.$store.state[this.manager].selectedDisk;
    },

    /**
     * Selected directory for this manager
     * @returns {default.computed.selectedDirectory|(function())|default.selectedDirectory|null}
     */
    selectedDirectory() {
      return this.$store.state[this.manager].selectedDirectory;
    },

    /**
     * Files list for selected directory
     * @returns {*}
     */
    files() {
      return this.$store.getters[`${this.manager}/files`];
    },

    /**
     * Directories list for selected directory
     * @returns {*}
     */
    directories() {
      return this.$store.getters[`${this.manager}/directories`];
    },

    /**
     * Selected files and folders
     * @returns {default.computed.selected|(function())|selected|{directories, files}|string|*|boolean}
     */
    selected() {
      return this.$store.state[this.manager].selected;
    },

    /**
     * ACL On/Off
     */
    acl() {
      return this.$store.state.settings.acl;
    },

    /**
     * Check if current path is at root level
     * @return {boolean}
     */
    isRootPath() {
      return this.$store.state[this.manager].selectedDirectory === null;
    },
  },
  methods: {
    /**
     * Load selected directory and show files
     * @param path
     */
    selectDirectory(path) {
      this.$store.dispatch(`${this.manager}/selectDirectory`, { path, history: true });
    },

    /**
     * Level up directory
     */
    levelUp() {
      // if this a not root directory
      if (this.selectedDirectory) {
        // calculate up directory path
        const pathUp = this.selectedDirectory.split('/').slice(0, -1).join('/');

        // load directory
        this.$store.dispatch(`${this.manager}/selectDirectory`, { path: pathUp || null, history: true });
      }
    },

    /**
     * Check item - selected
     * @param type
     * @param path
     */
    checkSelect(type, path) {
      return this.selected[type].includes(path);
    },

    /**
     * Select items in list (files + folders)
     * @param type
     * @param path
     * @param event
     */
    selectItem(type, path, event) {
      // search in selected array
      const alreadySelected = this.selected[type].includes(path);

      // if pressed Ctrl -> multi select
      if (event.ctrlKey) {
        if (!alreadySelected) {
          // add new selected item
          this.$store.commit(`${this.manager}/setSelected`, { type, path });
        } else {
          // remove selected item
          this.$store.commit(`${this.manager}/removeSelected`, { type, path });
        }
      }

      // single select
      if (!event.ctrlKey && !alreadySelected) this.$store.commit(`${this.manager}/changeSelected`, { type, path });
    },

    /**
     * Show context menu
     * @param item
     * @param event
     */
    contextMenu(item, event) {
      // el type
      const type = item.type === 'dir' ? 'directories' : 'files';
      // search in selected array
      const alreadySelected = this.selected[type].includes(item.path);

      // select this element
      if (!alreadySelected) {
        // select item
        this.$store.commit(`${this.manager}/changeSelected`, {
          type,
          path: item.path,
        });
      }

      // create event
      EventBus.$emit('contextMenu', event);
    },

    /**
     * Select and Action
     * @param path
     * @param extension
     */
    selectAction(path, extension) {
      // if is set fileCallback
      if (this.$store.state.fileCallback) {
        this.$store.dispatch('url', {
          disk: this.selectedDisk,
          path,
        }).then((response) => {
          if (response.data.result.status === 'success') {
            this.$store.state.fileCallback(response.data.url);
          }
        });

        return;
      }

      // if extension not defined
      if (!extension) {
        return;
      }

      // show, play..
      if (this.$store.state.settings.imageExtensions
        .includes(extension.toLowerCase())) {
        // show image
        this.$store.commit('modal/setModalState', {
          modalName: 'Preview',
          show: true,
        });
      } else if (Object.keys(this.$store.state.settings.textExtensions)
        .includes(extension.toLowerCase())) {
        // show text file
        this.$store.commit('modal/setModalState', {
          modalName: 'TextEdit',
          show: true,
        });
      } else if (this.$store.state.settings.audioExtensions
        .includes(extension.toLowerCase())) {
        // show player modal
        this.$store.commit('modal/setModalState', {
          modalName: 'AudioPlayer',
          show: true,
        });
      } else if (this.$store.state.settings.videoExtensions
        .includes(extension.toLowerCase())) {
        // show player modal
        this.$store.commit('modal/setModalState', {
          modalName: 'VideoPlayer',
          show: true,
        });
      }
    },
  },
};
