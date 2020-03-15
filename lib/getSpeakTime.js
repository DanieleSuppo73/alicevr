export function getSpeakTime(text) {
    const _speakingSpeed = 0.006;
    let st = text.split(" ");
    let seconds = (st.length * _speakingSpeed) * 60;
    return seconds;
}