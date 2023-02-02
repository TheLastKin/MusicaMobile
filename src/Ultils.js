import { useState } from "react";
import { AppState, Dimensions } from "react-native";

const fh = (hours) => {
    if (hours < 10) {
        return `0${hours}`;
    }
    return hours;
};

const fm = (minutes) => {
    if (minutes < 10) {
        return `0${minutes}`;
    }
    return minutes;
};

const fs = (seconds) => {
    if (seconds < 10) {
        return `0${seconds}`;
    }
    return seconds;
};

const getDuration = (time) => {
    if (time !== 0 && !isNaN(time)) {
        const hours = parseInt(time / 3600);
        const minutes = parseInt((time - 3600 * hours) / 60);
        const seconds = parseInt(time) - 3600 * hours - minutes * 60;
        if (hours !== 0) {
            return `${fh(hours)}:${fm(minutes)}:${fs(seconds)}`;
        }
        return `${fm(minutes)}:${fs(seconds)}`;
    }
    return '00:00';
};

const getTotalDuration = (medias) => {
    let duration = 0;
    for (const media of medias) {
        duration += media.duration;
    }
    return getDuration(duration);
};

const formatName = (name) => name?.replace(/(.mp4|.mp3|.mkv)$/g, "")

const Display = Dimensions.get("screen");

const useFocusEffect = (callback) => {
    AppState.addEventListener("change", state => {
        if(state === "active"){
            callback()
        }
    })
}

export { getDuration, getTotalDuration, formatName, Display, useFocusEffect }