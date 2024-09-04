pub trait ValidatableStrings {
	fn is_valid_steam_id(&self) -> bool;
	fn is_valid_steam_api_key(&self) -> bool;
	fn is_valid_email(&self) -> bool;
	fn len_between(&self, min: usize, max: usize) -> bool;
}

impl ValidatableStrings for String {
	fn is_valid_steam_id(&self) -> bool {
		self.len() == 17 && self.chars().all(|c| c.is_numeric())
	}

	fn is_valid_steam_api_key(&self) -> bool {
		self.len() == 32 && self.chars().all(|c| c.is_numeric() || (c.is_alphabetic() && c.is_uppercase()))
	}

	fn is_valid_email(&self) -> bool {
		self.contains('@') && self.contains('.') && self.len_between(10, 255)
	}

	fn len_between(&self, min: usize, max: usize) -> bool {
		self.len() >= min && self.len() <= max
	}
}