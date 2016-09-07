import expect from 'expect';

describe.skip('Enkle generatorfunksjoner', () => {

  function* simpleGen() {
    yield 1;
    yield 2;
    yield 3;
  }

  it('skal returnere verdier med yield', () => {
    const gen = simpleGen();
    expect(gen.next().value).toBe(1);
    expect(gen.next().value).toBe(2);
    expect(gen.next().value).toBe(3);

    const ferdig = gen.next();
    expect(ferdig.value).toNotExist();
    expect(ferdig.done).toBe(true);
  });

  function* overstyrGen() {
    const val1 = yield 1;
    console.log({val1});
    const val2 = yield val1 + 2;
    const val3 = yield val2 + 3;
  }

  it('verdien som yieldes er ikke den samme som fortsettes med inni generatoren', () => {
    let gen = overstyrGen();
    // Demonstrer at dette ikke vil funke uten å overstyre verdien med next
    expect(gen.next().value).toBe(1); // 1
    expect(isNaN(gen.next().value)).toBe(true); // NaN
    expect(isNaN(gen.next().value)).toBe(true); // NaN

    gen = overstyrGen();
    expect(gen.next().value).toBe(1);
    expect(gen.next(1).value).toBe(3);
    expect(gen.next(3).value).toBe(6);
  });

  function* errorGen() {
    try {
      yield 3;
      console.log('Ingen feil')
    } catch (e) {
      console.log('Feil', e);
    }
  }

  it('skal kunne kaste feil inni generatoren', () => {
    const gen = errorGen();
    // try {
    //   gen.throw(new Error('Fubarfeil'));
    // } catch (e) {
    //   console.log('Kastet feil med en gang, helt ut');
    // }
    gen.next();
    gen.throw(new Error('Fubarfeil'));
  });

  function* cde() {
    yield 'c';
    yield 'd';
    yield 'e';
  }

  function* alfabet() {
    yield 'a';
    yield 'b';
    yield* cde();
    yield 'f';
  }

  it('skal kunne delegere til andre generatorer', () => {
    for (const bokstav of alfabet()) console.log(bokstav);
  });
});
