const fs = require('fs');

const files = [
  "e:/metro-sewa/fronted/app/user/my-bookings/[id]/page.tsx",
  "e:/metro-sewa/fronted/app/user/my-bookings/page.tsx",
  "e:/metro-sewa/fronted/app/user/book-service/page.tsx",
  "e:/metro-sewa/fronted/app/technican/page.tsx",
  "e:/metro-sewa/fronted/app/technican/my-jobs/[id]/page.tsx",
  "e:/metro-sewa/fronted/app/technican/my-jobs/page.tsx",
  "e:/metro-sewa/fronted/app/services/page.tsx",
  "e:/metro-sewa/fronted/app/service/[category]/[id]/page.tsx",
  "e:/metro-sewa/fronted/app/component/Service.tsx",
  "e:/metro-sewa/fronted/app/component/AdminComponet/ServiceManagement/page.tsx",
  "e:/metro-sewa/fronted/app/component/AdminComponet/BookingManagement/page.tsx",
  "e:/metro-sewa/fronted/app/admin/page.tsx",
  "e:/metro-sewa/fronted/app/admin/bookings/[id]/page.tsx",
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');

  // Revert back to original string templates with NPR instead of Rs.
  
  if (file.includes('user/my-bookings/[id]/page.tsx')) {
    content = content.replace(/value=\{<><span className="text-emerald-600 font-bold">NPR<\/span> \{booking\.service\?\.price \?\? "N\/A"\}<\/>\}/g, 'value={`NPR ${booking.service?.price ?? "N/A"}`}');
  }
  
  if (file.includes('user/my-bookings/page.tsx')) {
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{b\.service\?\.price \?\? "—"\}<\/>/g, 'NPR {b.service?.price ?? "—"}');
  }

  if (file.includes('user/book-service/page.tsx')) {
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{service\.price\}<\/>/g, '`NPR ${service.price}`');
  }

  if (file.includes('technican/page.tsx')) {
    content = content.replace(/<span className="text-emerald-600">NPR<\/span> /g, 'NPR ');
  }

  if (file.includes('technican/my-jobs/[id]/page.tsx')) {
    content = content.replace(/value=\{<><span className="text-emerald-600 font-bold">NPR<\/span> \{job\.service\?\.price\}<\/>\}/g, 'value={`NPR ${job.service?.price}`}');
  }

  if (file.includes('technican/my-jobs/page.tsx')) {
    content = content.replace(/<span className="text-emerald-600">NPR<\/span> /g, 'NPR ');
  }

  if (file.includes('services/page.tsx')) {
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{service\.price\}<\/>/g, '`NPR ${service.price}`');
  }

  if (file.includes('service/[category]/[id]/page.tsx')) {
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{service\.price\}<\/>/g, '`NPR ${service.price}`');
  }

  if (file.includes('component/Service.tsx')) {
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{svc\.price\}<\/>/g, 'NPR {svc.price}');
  }

  if (file.includes('AdminComponet/ServiceManagement/page.tsx')) {
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{service\.price\.toLocaleString\(\)\}<\/>/g, '`NPR ${service.price.toLocaleString()}`');
  }

  if (file.includes('AdminComponet/BookingManagement/page.tsx')) {
    content = content.replace(/<span className="text-emerald-600 font-bold">NPR<\/span> /g, 'NPR ');
  }

  if (file.includes('admin/page.tsx')) {
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{dashboardStats\.totalRevenue\?\.toLocaleString\(\)\}<\/>/g, '`NPR ${dashboardStats.totalRevenue?.toLocaleString()}`');
    content = content.replace(/<><span className="text-emerald-600 font-bold">NPR<\/span> \{b\.amount \|\| b\.service\?\.price \|\| 0\}<\/>/g, 'NPR {b.amount || b.service?.price || 0}');
  }

  if (file.includes('admin/bookings/[id]/page.tsx')) {
    content = content.replace(/value=\{<><span className="text-emerald-600 font-bold">NPR<\/span> \{booking\.service\?\.price \|\| 0\}<\/>\}/g, 'value={`NPR ${booking.service?.price || 0}`}');
  }

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
