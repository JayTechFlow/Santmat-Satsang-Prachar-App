const fs = require('fs');
const path = require('path');

const dir = '/Users/jaymac/Documents/Santmat-Satsang-Prachar/admin-panel/src/features';
const files = [
  'stuti-vinati/services/stutiVinatiService.ts',
  'bhajans/services/bhajanService.ts',
  'books/services/bookService.ts',
  'banners/services/bannerService.ts',
  'users/services/userService.ts',
  'users/services/roleService.ts',
  'suvichar/services/suvicharService.ts',
  'categories/services/categoryService.ts',
  'notifications/services/notificationService.ts'
];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace auth import
    content = content.replace(/import \{ auth \} from '..\/..\/..\/firebase\/config';/g, "import { authService } from '../../../core/services/authService';");
    content = content.replace(/import \{ auth, db \} from '..\/..\/..\/firebase\/config';/g, "import { authService } from '../../../core/services/authService';\nimport { db } from '../../../firebase/config';");
    
    // Replace getCurrentUserId
    content = content.replace(/return auth\.currentUser\?\.uid \|\| 'system';/g, "return authService.getCurrentUserId() || 'system';");
    
    fs.writeFileSync(filePath, content);
  }
}
console.log('Services updated successfully');
