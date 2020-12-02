import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner'
import { TextInput } from 'react-native-gesture-handler';
import db from '../config'
import * as firebase from 'firebase'

export default class BookTransactionScreen extends React.Component{
    constructor(){
        super();
        this.state={
            hasCameraPermissions:null,
            scanned:false,
            scannedData:'',
            buttonState:'normal',
            scannedBookID:'',
            scannedStudentID:'',
            transactionMessage:''


        }
    }
    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status==='granted',
            buttonState:id,
            scanned:false
        })
    }

    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
        if(buttonState==="BookID"){
            this.setState({
                scanned:true,
                scannedBookID:data,
                buttonState:'normal'
            })

        }
        else if(buttonState==="StudentID"){
            this.setState({
                scanned:true,
                scannedStudentID:data,
                buttonState:'normal'
            })

        }
        
        
    }

    handleTransaction=async()=>{
        var transactionType=await this.checkBookEligibility();

        if(!transactionType){
            Alert.alert("The book does not exist in the library db");
            this.setState({
                scannedStudentID:'',
                scannedBookID:''
            })
           
        }
        else if(transactionType==="Issue"){
            var isStudentEligible= await this.checkStudentEligibityForBookIssue();
            if(isStudentEligible){
                this.initiateBookIssue()
                Alert.alert("Book issued to the student")
            }
        }
        else{
            var isStudentEligible=await this.checkBookEligibilityForReturn();
            if(isStudentEligible){
                this.initiateBookReturn()
                Alert.alert("Book returned to the library")
            }
        }
    }

    initiateBookIssue=async()=>{
        db.collection("transactions").add({
            'studentID':this.state.scannedStudentID,
            'bookID':this.state.scannedBookID,
            'date':firebase.firestore.TimeStamp.now().toDate(),
            'transactionType':"Issue"
        })

        db.collection("books").doc(this.state.scannedBookID).update({'bookAvailibility':false})
        db.collection("student").doc(this.state.scannedStudentID).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(1)
        })
    }

    initiateBookReturn=async()=>{
        db.collection("transactions").add({
            'studentID':this.state.scannedStudentID,
            'bookID':this.state.scannedBookID,
            'date':firebase.firestore.TimeStamp.now().toDate(),
            'transactionType':"Returned"
        })

        db.collection("books").doc(this.state.scannedBookID).update({'bookAvailibility':true})
        db.collection("student").doc(this.state.scannedStudentID).update({
            'numberOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
        })
    }

    checkBookEligibility=async()=>{
       const bookRef=await db.collection("books").where("bookID","==",this.state.scannedBookID).get();
        var transactionType="";
        if(bookRef.docs.length===0){
            transactionType=false
        }
        else{
            bookRef.docs.map(doc=>{
                var book=doc.data();
                if(book.bookAvailibility.then()){
                    transactionType="Issue"
                }
                else{
                    transactionType="Return"
                }
            })
        }
        return TransactionType;
        
    }

    checkStudentEligibityForBookIssue=async()=>{
        const studentRef=await db.collection("student").where("studentID","==",this.state.scannedStudentID).get()
        var isStudentEligible=""
        if(studentRef.docs.length===0){
            this.setState({
                scannedStudentID:'',
                scannedBookID:''
            })
            isStudentEligible=false
            Alert.alert("Student is not eligible for Book Issue")
        }
        else{
            studentRef.docs.map(doc=>{
                var student=docs.data()
                if(student.numberOfBooksIssued< 2){
                    isStudentEligible=true
                }
                else{
                    isStudentEligible=false
                    Alert.alert("The student is not eligible for issue as he/she already has 2 books")
                    this.setState({
                        scannedBookID:'',
                        scannedStudentID:''
                    })
                }
            })
        }
        return isStudentEligible
    }

    checkBookEligibilityForReturn=async()=>{
        const transactionRef=await db.collection("transaction").where("bookID","==",this.state.scannedBookID).limit(1).get()
        var isStudentEligible=""
        transactionRef.docs.map(doc=>{
            var transaction=docs.data()
            if(transaction.studentID===this.state.scannedStudentID){
                isStudentEligible=true
            }
            else{
                isStudentEligible=false
                Alert.alert("This student has not issued this book")
                this.setState({
                    scannedStudentID:'',
                    scannedBookID:''
                })
            }
            
        })
        return isStudentEligible
    }

    render(){
        const hasCameraPermissions=this.state.hasCameraPermission;
        const scanned=this.state.scanned;
        const buttonState=this.state.buttonState;

        if(hasCameraPermissions && buttonState!=='normal'){
            return(
                <BarCodeScanner
                onBarCodeScanned={
                    scanned ? undefined : this.handleBarCodeScanned 
                }

                style={StyleSheet.absoluteFillObject}
                />
            )

        }

        else if(buttonState==='normal'){
            return(
                <KeyboardAvoidingView style={styles.container}
                behavior="padding" enabled>
                    <View>
                        <Image
                        source={require("../assets/booklogo.jpg")}
                        style={{width:200,height:200}}
                        />
                        <Text style={{textAlign:'center',fontSize:30}}>Reader's Club</Text>
                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                        style={styles.inputBox}
                        placeholder="Book ID"
                        onChangeText={text=>this.setState({scannedBookID:text})}
                        value={this.state.scannedBookID}
                        />

                        <TouchableOpacity style={styles.scanButton}
                        onPress={()=>{
                            this.getCameraPermissions("BookID")
                        }}>
                            <Text style={styles.buttonText}>Scan </Text>
                        </TouchableOpacity>

                    </View>
                    <View style={styles.inputView}>
                        <TextInput
                        style={styles.inputBox}
                        placeholder="Student ID"
                        onChangeText={text=>this.setState({scannedStudentID:text})}
                        value={this.state.scannedStudentID}
                        />
                        <TouchableOpacity
                        style={styles.scanButton}
                        onPress={()=>{
                            this.getCameraPermissions("StudentID")
                        }}>
                            <Text style={styles.buttonText}>Scan</Text>
                        </TouchableOpacity>

                    </View>

                    <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={async()=>{
                        var transactionMessage=this.handleTransaction();
                        this.setState({
                            scannedBookID:'',
                            scannedStudentID:''
                        })
                    }}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            )
        }

       
        
    }
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    displayText:{
        fontSize:15,
    },
    scanButton:{
        backgroundColor:"#2196F3",
        padding:10,
        margin:10
    },
    buttonText:{
        fontSize:20,
        textAlign:'center',
        marginTop:10
    },
    inputView:{
        flexDirection:'row',
        margin:20,
        
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    scanButton:{
        backgroundColor:'#66BB6A',
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0
    },
    submitButton:{
        backgroundColor:'#FBC02D',
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:'bold',
        color:'white'
    }
})