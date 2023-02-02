import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import Colors from '../constants/Colors'
import axios from 'axios'
import { Display } from '../Ultils'

const progressBarWidth = Display.width * 0.55;

const ProgressBar = ({ onTimeUpdate, mediaDuration, currentTime }) => {

    const posLeft = useSharedValue(0)
    const width = useSharedValue(0)
    const scale = useSharedValue(1)

    const animatedPosLeft = useAnimatedStyle(() => ({ transform: [{ translateX: posLeft.value }] }))
    const animatedWidth = useAnimatedStyle(() => ({ width: width.value }))
    const animatedScale = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }))

    useEffect(() => {
        if(mediaDuration){
            posLeft.value = 0;
            width.value = 5;
            animateProgress(progressBarWidth, mediaDuration * 1000);
        }
    }, [mediaDuration])

    useEffect(() => {
        if(currentTime !== 0 && mediaDuration){
            posLeft.value = progressBarWidth * (currentTime / mediaDuration)
            width.value = progressBarWidth * (currentTime / mediaDuration) + 5
            animateProgress(progressBarWidth, (mediaDuration - currentTime) * 1000)
        }
    }, [currentTime])

    const animateProgress = (to, duration) => {
        posLeft.value = withTiming(to, { easing: Easing.linear, duration: duration })
        width.value = withTiming(to, { easing: Easing.linear, duration: duration })
    }

    const seekTo = time => {
        axios.get(`seekTo/${parseInt(time)}`)
    }

    const handleTimeUpdate = (posLeft) => {
        onTimeUpdate(mediaDuration * (posLeft / progressBarWidth))
    }

    const gesture = Gesture.Pan()
    .onTouchesDown(e => {
        posLeft.value = e.allTouches[0].x;
        width.value = e.allTouches[0].x + 5;
        scale.value = withTiming(2.5, { easing: Easing.ease, duration: 300 })
    })
    .onUpdate(e => {
        posLeft.value = Math.max(Math.min(e.x, progressBarWidth), 0)
        width.value = e.x + 5
        runOnJS(handleTimeUpdate)(posLeft.value)
    })
    .onTouchesUp(e => {
        scale.value = withTiming(0, { easing: Easing.ease, duration: 300 })
        runOnJS(handleTimeUpdate)(e.allTouches[0].x)
        runOnJS(animateProgress)(progressBarWidth, ((mediaDuration || 0) * (progressBarWidth - e.allTouches[0].x) / progressBarWidth) * 1000)
        runOnJS(seekTo)((mediaDuration || 0) * e.allTouches[0].x / progressBarWidth)
    })

    return (
        <GestureDetector gesture={gesture}>
            <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                    <Animated.View style={[styles.progressFill, animatedWidth]} />
                    <Animated.View style={[styles.progressThumb, animatedPosLeft]}>
                        <Animated.View style={[styles.thumbBloom, animatedScale]} />
                        <View style={styles.thumbButton} />
                    </Animated.View>
                </View>
            </View>
        </GestureDetector>
    )
}

export default ProgressBar

const styles = StyleSheet.create({
    
    progressBarContainer: {
        width: "55%",
        height: 10,
        justifyContent: "center"
    },
    progressBar: {
        width: "100%",
        height: 1.5,
        backgroundColor: "white",
        flexDirection: "row",
    },
    progressFill: {
        width: 0,
        height: 1.5,
        backgroundColor: Colors.LIGHT_BLUE
    },
    progressThumb: {
        position: "absolute",
        width: 10,
        height: 10,
        left: 0,
        top: -4.5,
        alignItems: "center",
        justifyContent: "center"
    },
    thumbButton: {
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: 500,
        backgroundColor: Colors.LIGHT_BLUE,
    },
    thumbBloom: {
        position: "absolute",
        width: 10,
        height: 10,
        borderRadius: 500,
        backgroundColor: "#add8e6",
        opacity: 0.3
    },
})