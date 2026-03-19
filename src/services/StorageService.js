/**
 * Storage Service - Supabase 存储操作封装
 * 统一的文件存储接口
 */

import { supabase } from '../supabase.js'

class StorageService {
  /**
   * 上传头像
   * @param {File} file - 文件对象
   * @param {string} userId - 用户ID
   * @returns {Promise<{url: string, path: string}>}
   */
  async uploadAvatar(file, userId) {
    try {
      // 生成唯一文件名
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${userId}/${fileName}`

      // 上传文件
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) throw error

      // 获取公开URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return {
        url: publicUrl,
        path: filePath
      }
    } catch (error) {
      console.error('上传头像失败:', error)
      throw error
    }
  }

  /**
   * 删除头像
   * @param {string} filePath - 文件路径
   */
  async deleteAvatar(filePath) {
    try {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath])

      if (error) throw error
    } catch (error) {
      console.error('删除头像失败:', error)
      throw error
    }
  }

  /**
   * 下载头像
   * @param {string} filePath - 文件路径
   * @returns {Promise<Blob>}
   */
  async downloadAvatar(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('avatars')
        .download(filePath)

      if (error) throw error
      return data
    } catch (error) {
      console.error('下载头像失败:', error)
      throw error
    }
  }

  /**
   * 获取头像URL
   * @param {string} filePath - 文件路径
   * @returns {string}
   */
  getAvatarUrl(filePath) {
    if (!filePath) return ''

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  /**
   * 上传文件到指定bucket
   * @param {string} bucket - 存储桶名称
   * @param {string} path - 文件路径
   * @param {File} file - 文件对象
   * @param {Object} options - 上传选项
   */
  async uploadFile(bucket, path, file, options = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('上传文件失败:', error)
      throw error
    }
  }

  /**
   * 删除文件
   * @param {string} bucket - 存储桶名称
   * @param {string[]} paths - 文件路径数组
   */
  async deleteFiles(bucket, paths) {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths)

      if (error) throw error
    } catch (error) {
      console.error('删除文件失败:', error)
      throw error
    }
  }

  /**
   * 下载文件
   * @param {string} bucket - 存储桶名称
   * @param {string} path - 文件路径
   */
  async downloadFile(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path)

      if (error) throw error
      return data
    } catch (error) {
      console.error('下载文件失败:', error)
      throw error
    }
  }

  /**
   * 获取文件公开URL
   * @param {string} bucket - 存储桶名称
   * @param {string} path - 文件路径
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return data.publicUrl
  }

  /**
   * 列出文件
   * @param {string} bucket - 存储桶名称
   * @param {string} path - 目录路径
   * @param {Object} options - 列表选项
   */
  async listFiles(bucket, path = '', options = {}) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
          ...options
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('列出文件失败:', error)
      throw error
    }
  }
}

export default new StorageService()
