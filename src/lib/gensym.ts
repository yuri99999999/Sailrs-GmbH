let gensymSeed = 0;

export default function gensym(): string {
    return `$$gensym$$_xjKvAjFXoVtro45V_${gensymSeed++}$$`;
}
