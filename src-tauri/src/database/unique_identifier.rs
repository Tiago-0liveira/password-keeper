pub type UniqueIdentifier = i32;

pub trait UniquelyIdentified {
	const DEFAULT_UUID: UniqueIdentifier = -1;
	fn set_uuid(&mut self, uuid: i32);
	fn get_uuid(&self) -> i32;
}

#[macro_export]
macro_rules! make_uuid_struct {
    ($struct_name:ident { $($field_name:ident: $field_type:ty),* $(,)? }) => {
        // Define the struct with the provided fields and a `uuid` field
		use crate::database::unique_identifier::{UniqueIdentifier, UniquelyIdentified};
		#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
        pub struct $struct_name {
            pub uuid: UniqueIdentifier,
            $(pub $field_name: $field_type),*
        }

        // Automatically implement the UniquelyIdentified trait for the struct
        impl UniquelyIdentified for $struct_name {
            fn set_uuid(&mut self, uuid: UniqueIdentifier) {
                self.uuid = uuid;
            }
			fn get_uuid(&self) -> UniqueIdentifier {
				self.uuid
			}
        }
    };
}