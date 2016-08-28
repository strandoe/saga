import { Poster } from '../felles/postliste';
import { OPPLYSNINGSFELT_TYPE, ALDERSPENSJONSTYPE } from '../felles/Konstanter';

export function reisefradragspost(skatteobjektstype, id) {
    return {
        skatteobjektstype: skatteobjektstype,
        beloep: 0,
        kmPrReise: undefined,
        antallReiser: undefined,
        '@type': 'ske.fastsetting.skatt.skattegrunnlag.v2_0.ReiseutgiftXml',
        id,
    };
}

export function alderspensjonspost(skatteobjektstype, id) {
    return {
        skatteobjektstype,
        beloep: undefined,
        '@type': ALDERSPENSJONSTYPE,
        id,
        pensjonsgrad: skatteobjektstype === Poster.inntektPensjonSupplerendeStoenad ? '100' : undefined,
    };
}

export function ensligforsoergerpost(id) {
    return {
        skatteobjektstype: Poster.inntektsfradragSaerfradragEnslig,
        beloep: undefined,
        '@type': 'ske.fastsetting.skatt.skattegrunnlag.v2_0.EnsligForsoergerXml',
        id,
    };
}

export function opplysningHarFlereArbeidsgiverepost(id) {
    return {
        skatteobjektstype: Poster.opplysningHarFlereArbeidsgivere,
        opplysning: 'true',
        '@type': OPPLYSNINGSFELT_TYPE,
        id,
    };
}

export function vanligPost(skatteobjektstype, id) {
    return {
        skatteobjektstype: skatteobjektstype,
        beloep: undefined,
        '@type': 'ske.fastsetting.skatt.skattegrunnlag.v2_0.SkattegrunnlagsobjektXml',
        id,
    };
}

export function byggNyPost(skatteobjektstype, id) {
    switch (skatteobjektstype) {
    case Poster.inntektPensjonAlderspensjonFolketrygd:
    case Poster.inntektPensjonAvtalefestet:
    case Poster.inntektPensjonSupplerendeStoenad:
        return alderspensjonspost(skatteobjektstype, id);

    case Poster.inntektsfradragReiseutgifterReiseHjemArbeid:
    case Poster.inntektsfradragReiseutgifterBesoeksreise:
        return reisefradragspost(skatteobjektstype, id);

    case Poster.inntektsfradragSaerfradragEnslig:
        return ensligforsoergerpost(id);

    case Poster.opplysningHarFlereArbeidsgivere:
        return opplysningHarFlereArbeidsgiverepost(id);

    default:
        return vanligPost(skatteobjektstype, id);
    }
}
