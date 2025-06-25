export abstract class Either<L, R> {
  abstract isLeft(): this is Left<L, R>;
  abstract isRight(): this is Right<L, R>;
  abstract fold<T>(onLeft: (left: L) => T, onRight: (right: R) => T): T;
}

export class Left<L, R> extends Either<L, R> {
  constructor(public readonly value: L) {
    super();
  }

  isLeft(): this is Left<L, R> {
    return true;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  fold<T>(onLeft: (left: L) => T, onRight: (right: R) => T): T {
    return onLeft(this.value);
  }
}

export class Right<L, R> extends Either<L, R> {
  constructor(public readonly value: R) {
    super();
  }

  isLeft(): this is Left<L, R> {
    return false;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  fold<T>(onLeft: (left: L) => T, onRight: (right: R) => T): T {
    return onRight(this.value);
  }
}

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);