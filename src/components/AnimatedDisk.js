import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated'

const background = require("../assets/disc.jpg");

const AnimatedDisk = () => {
    const AnimatedImage = Animated.createAnimatedComponent(Image)
    const rotate = useSharedValue(0)

    const animatedRotation = useAnimatedStyle(() => ({ transform: [{ rotate: rotate.value + "deg" }] }))

    useEffect(() => {
        rotate.value = withRepeat(withTiming(360, { easing: Easing.linear, duration: 8000 }), -1)
    }, [])

    return (
        <AnimatedImage style={[styles.disc, animatedRotation]} source={background} />
    )
}

export default AnimatedDisk

const styles = StyleSheet.create({
    disc: {
        width: 250,
        height: 250,
        borderRadius: 500,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        elevation: 15,
    }
})