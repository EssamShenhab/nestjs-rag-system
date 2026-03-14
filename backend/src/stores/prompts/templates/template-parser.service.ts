import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class TemplateParser {
  private current_path: string;
  private default_language: string | null = null;
  private language: string | null = null;

  constructor(language?: string, default_language = 'en') {
    this.current_path = path.join(__dirname);
    this.default_language = default_language;
    this.setLanguage(language);
  }

  setLanguage(language?: string) {
    if (!language) {
      this.language = this.default_language;
      return;
    }

    const language_path = path.join(this.current_path, 'locales', language);

    if (fs.existsSync(language_path)) {
      this.language = language;
    } else {
      this.language = this.default_language;
    }
  }

  get(group: string, key: string, vars: Record<string, any> = {}) {
    if (!group || !key) {
      return null;
    }

    let targeted_language = this.language;

    let group_path = path.join(
      this.current_path,
      'locales',
      targeted_language!,
      `${group}.js`,
    );

    if (!fs.existsSync(group_path)) {
      targeted_language = this.default_language;

      group_path = path.join(
        this.current_path,
        'locales',
        targeted_language!,
        `${group}.js`,
      );
    }

    if (!fs.existsSync(group_path)) {
      return null;
    }

    let module: any;

    try {
      module = require(group_path);
    } catch {
      return null;
    }

    if (!module) {
      return null;
    }

    const template = module[key];

    if (!template) {
      return null;
    }

    return this.substitute(template, vars);
  }

  private substitute(template: string, vars: Record<string, any>) {
    let result = template;

    for (const key of Object.keys(vars)) {
      const value = vars[key];
      result = result.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
    }

    return result;
  }
}
