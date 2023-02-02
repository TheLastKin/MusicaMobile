import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AppState,
    DeviceEventEmitter,
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    Keyboard,
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import axios from 'axios';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons"
import Ionicons from 'react-native-vector-icons/Ionicons'
import PagerView from 'react-native-pager-view';
import Colors from './constants/Colors';
import { io } from 'socket.io-client';
import { Display, formatName, getDuration } from './Ultils';
import PlaylistsPage from './PlaylistsPage';
import DisplayPage from './DisplayPage';
import PlaylistPage from './PlaylistPage';
import ProgressBar from './components/ProgressBar';

const socket = io("http://192.168.1.5:3000")
const background = require("./assets/disc.jpg");

let mediaTimer = 0;
let duration = 0;
let intervalId = -1;

const MainPage = () => {
    const [isPlaying, setPlaying] = useState(true)
    const [playlists, setPlaylists] = useState([])
    const [playlist, setPlaylist] = useState([])
    const [media, setMedia] = useState()
    const [config, setConfig] = useState({ isShuffle: false, repeat: "none", timer: Infinity, turnOff: false })
    const [currentTime, setCurrentTime] = useState(0)

    const timeRef = useRef();

    const startTimer = (textRef, mediaDuration, startAt = 0) => {
        duration = mediaDuration;
        mediaTimer = startAt;
        textRef.setNativeProps({ text: `${getDuration(mediaTimer)}/${getDuration(duration)}`});
        if(intervalId === -1){
            intervalId = setInterval(() => {
                mediaTimer++;
                textRef.setNativeProps({ text: `${getDuration(mediaTimer)}/${getDuration(duration)}`});
                if(mediaTimer >= duration){
                    clearInterval(intervalId);
                    intervalId = -1;
                }
            }, 1000)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (media) {
            if(typeof(config.timer) === "number" && config.timer !== Infinity && config.timer !== 0){
                setConfig({ ...config, timer: config.timer - 1 })
            }
            startTimer(timeRef.current, media.duration)
        }
    }, [media])

    useEffect(() => {
        if(currentTime !== 0 && media){
            startTimer(timeRef.current, media.duration, currentTime)
        }
    }, [currentTime])

    const getData = () => {
        axios.get("playlists").then(res => setPlaylists(res.data))
        axios.get("media").then(res => setMedia(res.data))
        axios.get("playlist").then(res => setPlaylist(res.data))
        socket.on("connect", () => {
            socket.on("onMediaChanged", (m) => {
                setMedia(m);
            })
            socket.on("onPlaylistChanged", (p) => setPlaylist(p))
            socket.on("onConfigChanged", (c) => {
                setConfig({ isShuffle: c.isShuffle, repeat: c.repeat, timer: c.timer })
            })
            socket.on("onTimeUpdate", time => setCurrentTime(time))
        })
    }

    const changeMedia = next => () => {
        axios.get(`changeMedia/${next}`);
    }

    const togglePlay = () => {
        axios.get("togglePlay")
        setPlaying(!isPlaying)
        if(isPlaying){
            clearInterval(intervalId)
        }else{
            startTimer(timeRef.current, media.duration, mediaTimer)
        }
    }

    const toggleShuffle = () => {
        axios.get("shufflePlaylist")
        setConfig({ ...config, isShuffle: !config.isShuffle })
    }

    const toggleRepeat = () => {
        axios.get("toggleRepeat")
        if (config.repeat === 'none') {
            setConfig({ ...config, repeat: 'repeat' });
        } else if (config.repeat === 'repeat') {
            setConfig({ ...config, repeat: 'repeat-one' });
        } else {
            setConfig({ ...config, repeat: 'none' });
        }
    }
    

    const changeVolume = inc => () => {
        axios.get(`changeVolume/${inc}`)
    }

    const turnOffPC = state => () => {
        if(config.timer !== Infinity && typeof(config.timer) === "number"){
            setConfig({ ...config, turnOff: state })
        }else{
            axios.get(`turnOff/${state}`)
        }
    }

    const increaseTimer = () => {
        axios.get("changeTimer/increase")
        if(config.timer === Infinity || config.timer === null){
            setConfig({ ...config, timer: 1 })
        }else{
            setConfig({ ...config, timer: config.timer + 1 })
        }
    }

    const clearTimer = () => {
        setConfig({ ...config, timer: Infinity, turnOff: false });
        axios.get("changeTimer/clear")
    }

    const onTimeUpdate = (time) => {
        if (media) {
            mediaTimer = time
            timeRef.current.setNativeProps({ text: `${getDuration(time)}/${getDuration(media.duration)}` })
        }
    }

    return (
        <ImageBackground source={background} blurRadius={10} style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="transparent"
            />
            <View style={styles.glass}>
            </View>
            <PagerView style={styles.pagerContainer} initialPage={1}>
                <PlaylistsPage key="1" playlists={playlists} currentPlaylistName={playlist?.name}/>
                <DisplayPage key="2" mediaName={formatName(media?.name)}/>
                <PlaylistPage key="3" medias={playlist?.medias} mediaName={media?.name}/>
            </PagerView>
            <View style={styles.actionGroup}>
                <View style={styles.ultilityGroup}>
                    <MaterialCommunityIcons style={styles.ultilityIcon} name="volume-plus" onPress={changeVolume("increase")} />
                    <MaterialCommunityIcons style={styles.ultilityIcon} name="volume-minus" onPress={changeVolume("decrease")} />
                    <MaterialCommunityIcons style={[styles.ultilityIcon, { color: config.turnOff === "sleep" ? Colors.LIGHT_BLUE : (config.turnOff === "shutdown" ? "red" : Colors.WHITE) }]} name="shield-lock" onPress={turnOffPC("sleep")} onLongPress={turnOffPC("shutdown")} />
                    <MaterialCommunityIcons style={styles.ultilityIcon} name="reload" onPress={getData}/>
                </View>
                <View style={styles.progressGroup}>
                    {
                        typeof(config.timer) === 'number' && config.timer !== Infinity ?
                        <Text style={styles.timer} onPress={increaseTimer} onLongPress={clearTimer}>{config.timer}</Text> : 
                        <MaterialCommunityIcons style={styles.icon} name="timer-outline" onPress={increaseTimer}/>
                    }
                    <ProgressBar onTimeUpdate={onTimeUpdate} mediaDuration={media?.duration} currentTime={currentTime}/>
                    <TextInput ref={timeRef} editable={false} style={styles.duration} defaultValue={`00:00/${getDuration(media?.duration)}`} />
                </View>
                <View style={styles.controlGroup}>
                    <MaterialCommunityIcons 
                        style={[styles.icon, { color: config.repeat !== "none" ? Colors.LIGHT_BLUE : "white" }]} 
                        name={config.repeat === "repeat-one" ? "repeat-once" : "repeat"} 
                        onPress={toggleRepeat}
                    />
                    <TouchableOpacity style={styles.action} onPress={changeMedia("previous")}>
                        <Ionicons style={styles.controlIcon} name="play-skip-back" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.action} onPress={togglePlay}>
                        <Ionicons style={[styles.controlIcon, { fontSize: 44, color: isPlaying ? Colors.LIGHT_BLUE : "white" }]} name={isPlaying ? "pause-circle-outline" : "play-circle-outline"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.action} onPress={changeMedia("next")}>
                        <Ionicons style={styles.controlIcon} name="play-skip-forward" />
                    </TouchableOpacity>
                    <MaterialCommunityIcons style={[styles.icon, { color: config.isShuffle ? Colors.LIGHT_BLUE : "white" }]} name="shuffle-variant" onPress={toggleShuffle}/>
                </View>
            </View>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    glass: {
        position: "absolute",
        width: Display.width,
        height: Display.height,
        backgroundColor: "black",
        opacity: 0.65
    },
    pagerContainer: {
        flex: 1,
    },
    performerName: {
        fontSize: 14,
        color: "white",
        marginTop: 10
    },
    icon: {
        fontSize: 20,
        color: "white"
    },
    controlIcon: {
        fontSize: 26,
        color: "white"
    },
    ultilityGroup: {
        width: Display.width,
        height: 30,
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "row"
    },
    ultilityIcon: {
        fontSize: 26,
        color: "white",
        opacity: 0.85
    },
    actionGroup: {
        width: Display.width,
        height: 200,
        alignItems: "center",
        justifyContent: "flex-end",
        paddingBottom: 20,
    },
    progressGroup: {
        width: Display.width,
        height: 50,
        alignItems: "center",
        justifyContent: "space-evenly",
        flexDirection: "row"
    },
    duration: {
        width: 100,
        fontSize: 12,
        color: "white",
        textAlign: "center"
    },
    controlGroup: {
        width: Display.width,
        height: 80,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly"
    },
    item: {
        width: Display.width,
        height: 60,
        paddingHorizontal: 15,
        justifyContent: "center",
    },
    itemMediaName: {
        fontSize: 14,
        color: "white"
    },
    itemMediaDuration: {
        fontSize: 12,
        color: "#bfbfbf",
        marginTop: 5
    },
    selectedItem: {
        position: "absolute",
        width: Display.width,
        height: "100%",
        opacity: 0.45
    },
    timer: {
        fontSize: 18,
        color: Colors.LIGHT_BLUE,
        fontWeight: "bold"
    },
});

export default MainPage