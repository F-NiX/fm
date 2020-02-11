export default {
  computed: {
    /**
     * Selected translate
     * @returns {*}
     */
    lang() {
      // If selected translations exists
      if (Object.prototype.hasOwnProperty.call(
        this.$store.state.settings.translations,
        this.$store.state.settings.lang,
      )) {
        return this.$store.state.settings.translations[
          this.$store.state.settings.lang
        ];
      }
      // default translate - en
      return this.$store.state.settings.translations.en;
    },
  },
};
