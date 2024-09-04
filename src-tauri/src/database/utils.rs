pub struct Pair<T, U>(pub T, pub U);

#[derive(Debug)]
pub enum Either<T, U> {
	Left(T),
	Right(U)
}
