var create_luminous_db = function() {
  var db = new Dexie('luminous');

  // Read more at: http://dexie.org/docs/Tutorial/Design#database-versioning
  db.version(1).stores({
    reports: 'id,key,domain,kind,code,allowed,blocked,calls'
  });

  db.version(2).stores({
    reports: 'id,key,domain,kind,[domain+kind],code,allowed,blocked,calls'
  });

  db.version(3).stores({
    reports: 'id,key,domain,kind,[domain+kind],code,allowed,blocked,calls,execution_time'
  });

  return db;
}
