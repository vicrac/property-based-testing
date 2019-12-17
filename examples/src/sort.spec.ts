import * as fc from "fast-check";

function dummyCompare(a, b) {
  return 0;
}

test("sorting with dummy compare doesn't alter order of elements", () => {
  fc.assert(
    fc.property(fc.array(fc.integer(), 500), data => {
      const sorted = [...data].sort(dummyCompare);
      expect(sorted).toEqual(data);
    })
  );
});

test("sorting possibly undefined values with dummy compare doesn't alter order of elements", () => {
  fc.assert(
    fc.property(
      fc.array(fc.oneof(fc.integer(), fc.constant(undefined))),
      data => {
        const sorted = [...data].sort(dummyCompare);
        expect(sorted).toEqual(data);
      }
    )
  );
});

const isNil = <A>(a: A | null | undefined): a is null | undefined => {
  return a === null || a === undefined;
};

type Ordering = -1 | 0 | 1;
type Compare = (a: number, b: number) => Ordering;

function compare(a: number, b: number) {
  return a === b ? 0 : a > b ? 1 : -1;
}

function undefinedAtBeginningCompare(a: number, b: number): Ordering {
  return isNil(a) && isNil(b)
    ? 0
    : isNil(a)
    ? -1
    : isNil(b)
    ? 1
    : compare(a, b);
}

test("Sorting to undefined at the beginning works", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), data => {
      const dataWithUndefinedAtBeginning = [undefined, ...data];
      const sorted = [...dataWithUndefinedAtBeginning].sort(
        undefinedAtBeginningCompare
      );
      expect(sorted).toEqual(dataWithUndefinedAtBeginning);
    })
  );
});

// Explanation why it doesn't work here:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description

const reverse = <T>(xs: T[]): T[] => xs.reduce((acc, e) => [e, ...acc], []);

test("Reversing an array twice goes back to initial value", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), data => {
      const reversedTwice = reverse(reverse(data));
      expect(reversedTwice).toEqual(data);
    })
  );
});

test("Reversing an array with possibly undefined values twice goes back to initial value", () => {
  fc.assert(
    fc.property(
      fc.array(fc.oneof(fc.integer(), fc.constant(undefined))),
      data => {
        const reversedTwice = reverse(reverse(data));
        expect(reversedTwice).toEqual(data);
      }
    )
  );
});

const dualCompare = (compare: Compare): Compare => (a, b) => compare(b, a);

test("sorting then reversing an array is the same as sorting it in the dual order", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), data => {
      const sorted = [...data].sort(undefinedAtBeginningCompare);
      const sortedReverse = [...data].sort(
        dualCompare(undefinedAtBeginningCompare)
      );
      expect(sorted).toEqual(reverse(sortedReverse));
    })
  );
});

test("sorting then reversing an array with possibly undefined values is the same as sorting it in the dual order", () => {
  fc.assert(
    fc.property(
      fc.array(fc.oneof(fc.integer(), fc.constant(undefined))),
      data => {
        const sorted = [...data].sort(undefinedAtBeginningCompare);
        const sortedReverse = [...data].sort(
          dualCompare(undefinedAtBeginningCompare)
        );
        expect(sorted).toEqual(reverse(sortedReverse));
      }
    )
  );
});
