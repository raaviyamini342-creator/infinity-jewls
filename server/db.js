const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Collection {
  constructor(name) {
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(fileContent || '[]');
      } else {
        this.data = [];
        this.save();
      }
    } catch (error) {
      console.error(`Error loading collection ${this.filePath}:`, error);
      this.data = [];
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error saving collection ${this.filePath}:`, error);
    }
  }

  find(query = {}) {
    return this.data.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(query = {}) {
    return this.data.find(item => {
      for (const key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findById(id) {
    return this.data.find(item => item.id === id);
  }

  create(item) {
    const newItem = {
      id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    this.data.push(newItem);
    this.save();
    return newItem;
  }

  update(query, updateData) {
    let updatedCount = 0;
    this.data = this.data.map(item => {
      let matches = true;
      for (const key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      if (matches) {
        updatedCount++;
        return {
          ...item,
          ...updateData,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    });
    if (updatedCount > 0) {
      this.save();
    }
    return updatedCount;
  }

  updateById(id, updateData) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data[index];
    }
    return null;
  }

  delete(query) {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => {
      let matches = true;
      for (const key in query) {
        if (item[key] !== query[key]) {
          matches = false;
          break;
        }
      }
      return !matches;
    });
    const deletedCount = initialLength - this.data.length;
    if (deletedCount > 0) {
      this.save();
    }
    return deletedCount;
  }

  deleteById(id) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      const deletedItem = this.data.splice(index, 1)[0];
      this.save();
      return deletedItem;
    }
    return null;
  }
}

const db = {
  users: new Collection('users'),
  products: new Collection('products'),
  orders: new Collection('orders'),
  messages: new Collection('messages')
};

module.exports = db;
