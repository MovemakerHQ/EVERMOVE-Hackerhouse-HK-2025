module EmotionApt::records {
  use std::string::{String};
  use std::signer;
  use std::vector;
  use aptos_framework::timestamp;
  // records struct
  struct Record has key, store, drop, copy {
      keywords: String,
      description: String,
      timestamp: u64,
  }

  struct Records has key, store, drop, copy {
      records: vector<Record>,
  }

  // Error codes
  const NoUserRecords: u64 = 20;

  public entry fun init(account: &signer) acquires Records {
    if (exists<Records>(signer::address_of(account))) {
      let _old_records = move_from<Records>(signer::address_of(account));
    };
    let records = Records {
      records: vector<Record>[],
    };
    move_to<Records>(account, records);
  }

  // add record
  public entry fun add_record(account: &signer, keywords: String, description: String) acquires Records {
    assert!(exists<Records>(signer::address_of(account)), NoUserRecords);
    let timestamp = timestamp::now_seconds();
    let records = borrow_global_mut<Records>(signer::address_of(account));
    let record = Record {
      keywords,
      description,
      timestamp,
    };
    vector::push_back(&mut records.records, record);
  }
  // delete record
  public entry fun delete_record(account: &signer, index: u64) acquires Records {
    assert!(exists<Records>(signer::address_of(account)), NoUserRecords);
    let records = borrow_global_mut<Records>(signer::address_of(account));
    vector::remove(&mut records.records, index);
  }
  #[view]
  // get all records
  public fun get_all_records(address: address): vector<Record>  acquires Records {
    assert!(exists<Records>(address), NoUserRecords);
    let records = borrow_global<Records>(address);
    records.records
  }
}
