import { prisma } from '../lib/prisma';
import { AppError } from '../utils/errors';

export class SettingsService {
  /**
   * Get all settings
   */
  async getAllSettings() {
    const settings = await prisma.setting.findMany();
    
    // Convert to key-value object
    const settingsObj: Record<string, any> = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = {
        value: setting.value,
        type: setting.type,
        description: setting.description
      };
    });

    return settingsObj;
  }

  /**
   * Get single setting by key
   */
  async getSetting(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!setting) {
      throw new AppError('Setting not found', 404);
    }

    return setting;
  }

  /**
   * Update or create setting
   */
  async upsertSetting(key: string, value: string, type?: string, description?: string) {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { 
        value,
        ...(type && { type }),
        ...(description && { description })
      },
      create: {
        key,
        value,
        type: type || 'string',
        description: description || ''
      }
    });

    return setting;
  }

  /**
   * Update multiple settings at once
   */
  async updateMultipleSettings(settings: Array<{ key: string; value: string }>) {
    const promises = settings.map(({ key, value }) =>
      this.upsertSetting(key, value)
    );

    await Promise.all(promises);

    return { message: 'Settings updated successfully' };
  }

  /**
   * Delete setting
   */
  async deleteSetting(key: string) {
    const setting = await prisma.setting.findUnique({
      where: { key }
    });

    if (!setting) {
      throw new AppError('Setting not found', 404);
    }

    await prisma.setting.delete({
      where: { key }
    });

    return { message: 'Setting deleted successfully' };
  }

  /**
   * Initialize default settings if they don't exist
   */
  async initializeDefaultSettings() {
    const defaults = [
      {
        key: 'site_name',
        value: 'Atlas Africa',
        type: 'string',
        description: 'Website name displayed in header and emails'
      },
      {
        key: 'site_description',
        value: 'Creative Marketing Agency',
        type: 'string',
        description: 'Site tagline or description'
      },
      {
        key: 'contact_email',
        value: 'hello@atlasafrica.org',
        type: 'email',
        description: 'Main contact email address'
      },
      {
        key: 'notifications_enabled',
        value: 'true',
        type: 'boolean',
        description: 'Enable email notifications for new submissions'
      },
      {
        key: 'maintenance_mode',
        value: 'false',
        type: 'boolean',
        description: 'Put site in maintenance mode'
      },
      {
        key: 'posts_per_page',
        value: '10',
        type: 'number',
        description: 'Number of blog posts per page'
      },
      {
        key: 'allow_comments',
        value: 'false',
        type: 'boolean',
        description: 'Enable blog post comments'
      },
      {
        key: 'google_analytics_id',
        value: '',
        type: 'string',
        description: 'Google Analytics tracking ID'
      },
      {
        key: 'facebook_url',
        value: '',
        type: 'url',
        description: 'Facebook page URL'
      },
      {
        key: 'twitter_url',
        value: '',
        type: 'url',
        description: 'Twitter/X profile URL'
      },
      {
        key: 'instagram_url',
        value: '',
        type: 'url',
        description: 'Instagram profile URL'
      },
      {
        key: 'linkedin_url',
        value: '',
        type: 'url',
        description: 'LinkedIn company page URL'
      }
    ];

    for (const setting of defaults) {
      const existing = await prisma.setting.findUnique({
        where: { key: setting.key }
      });

      if (!existing) {
        await prisma.setting.create({ data: setting });
      }
    }

    return { message: 'Default settings initialized' };
  }
}
