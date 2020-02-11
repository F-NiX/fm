import HTTP from './axios';

export default {
  /**
   * Get configuration data from server
   * @returns {AxiosPromise<any>}
   */
  initialize() {
    return HTTP.get('initialize');
  },

  /**
   * Get directories for the tree (upper level)
   * @param disk
   * @param path
   * @returns {AxiosPromise<any>}
   */
  tree(disk, path) {
    return HTTP.get('tree', { params: { disk, path } });
  },

  /**
   * Select disk
   * @param disk
   * @returns {AxiosPromise<any>}
   */
  selectDisk(disk) {
    return HTTP.get('select-disk', { params: { disk } });
  },

  /**
   * Get content (files and folders)
   * @param disk
   * @param path
   * @returns {AxiosPromise<any>}
   */
  content(disk, path) {
    return HTTP.get('content', { params: { disk, path } });
  },

  /**
   * Item properties
   * @param disk
   * @param path
   * @returns {AxiosPromise<any>}
   */
  /* properties(disk, path) {
    return HTTP.get('properties', { params: { disk, path } });
  }, */

  /**
   * URL
   * @param disk
   * @param path
   * @returns {*}
   */
  url(disk, path) {
    return HTTP.get('url', { params: { disk, path } });
  },

  /**
   * Get file to editing or showing
   * @param disk
   * @param path
   * @returns {*}
   */
  getFile(disk, path) {
    return HTTP.get('download', { params: { disk, path } });
  },

  /**
   * Image thumbnail
   * @param disk
   * @param path
   * @returns {*}
   */
  thumbnail(disk, path) {
    return HTTP.get('thumbnails', {
      responseType: 'arraybuffer',
      params: { disk, path },
    });
  },

  /**
   * Image preview
   * @param disk
   * @param path
   * @return {*}
   */
  preview(disk, path) {
    return HTTP.get('preview', {
      responseType: 'arraybuffer',
      params: { disk, path },
    });
  },

  /**
   * Download file
   * @param disk
   * @param path
   * @return {*}
   */
  download(disk, path) {
    return HTTP.get('download', {
      responseType: 'arraybuffer',
      params: { disk, path },
    });
  },
};
