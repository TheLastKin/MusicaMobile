import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import AnimatedDisk from './components/AnimatedDisk'

const DisplayPage = ({ mediaName }) => {
    return (
        <View style={styles.discContainer}>
            <AnimatedDisk />
            <Text style={styles.mediaName}>{mediaName}</Text>
        </View>
    )
}

export default DisplayPage

const styles = StyleSheet.create({
    discContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    mediaName: {
        maxWidth: "60%",
        fontSize: 16,
        color: "white",
        marginTop: 25,
        textAlign: "center"
    },
})