import expect from 'expect';

describe('Enkle generatorfunksjoner', () => {

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
    const val1 = yield { type: 'hei' };
    const val2 = yield Object.assign({ payload: 'hello' }, val1);
  }

  it('skal kunne overstyre verdien inne i generatoren', () => {
    const gen = overstyrGen();
    expect(gen.next().value).toEqual({ type: 'hei'});
    expect(gen.next({type: 'mordi'}).value).toEqual({ payload: 'hello', type: 'mordi'});
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
  })
});
