import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, TextInput, Alert, ScrollView, FlatList, Modal, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const menu = [
    { id: 1, name: "Idli", price: 8, category: "veg", image: "🥘", rating: 4.5 },
    { id: 2, name: "Plain Dosa", price: 40, category: "veg", image: "🥘", rating: 4.3 },
    { id: 3, name: "Onion Dosa", price: 60, category: "veg", image: "🥘", rating: 4.6 },
    { id: 4, name: "Masala Dosa", price: 70, category: "veg", image: "🥘", rating: 4.8 },
    { id: 5, name: "Special Dosa", price: 80, category: "veg", image: "🥘", rating: 4.9 },
    { id: 6, name: "Uthappam", price: 50, category: "veg", image: "🥘", rating: 4.4 },
    { id: 7, name: "Paratha", price: 30, category: "veg", image: "🥘", rating: 4.5 }
];

export default function App() {
    const [screen, setScreen] = useState("login");
    const [user, setUser] = useState(null);
    const [mobile, setMobile] = useState(""");
    const [otp, setOtp] = useState(""");
    const [verifyingOTP, setVerifyingOTP] = useState(false);
    const [userProfile, setUserProfile] = useState({ name: "", email: "", savedAddresses: [] });
    const [cart, setCart] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState(""");
    const [priceFilter, setPriceFilter] = useState(200);
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [selectedPayment, setSelectedPayment] = useState("upi");
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showOrderTracking, setShowOrderTracking] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderStatus, setOrderStatus] = useState("confirming");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedItemForReview, setSelectedItemForReview] = useState(null);
    const [reviews, setReviews] = useState({});
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState(""");
    const [firstOrder, setFirstOrder] = useState(true);

    const handleLoginWithMobile = () => {
        if (!mobile || mobile.length < 10) {
            Alert.alert("Invalid Mobile", "Please enter a valid 10-digit mobile number");
            return;
        }
        setVerifyingOTP(true);
        setTimeout(() => {
            setVerifyingOTP(false);
            Alert.alert("OTP Sent", "OTP has been sent to your mobile number");
        }, 1000);
    };

    const handleOTPVerification = () => {
        if (otp !== "1234") {
            Alert.alert("Invalid OTP", "Please enter correct OTP");
            return;
        }
        setUser({ mobile, name: "User " + mobile.slice(-4) });
        setUserProfile({ ...userProfile, name: "User " + mobile.slice(-4) });
        setScreen("home");
    };

    const addToCart = (item) => {
        const existingItem = cart.find((cartItem) => cartItem.id === item.id);
        if (existingItem) {
            setCart(
                cart.map((cartItem) =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                )
            );
        } else {
            setCart([...cart, { ...item, quantity: 1 }]);
        }
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter((item) => item.id !== itemId));
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart(
                cart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
            );
        }
    };

    const toggleFavorite = (item) => {
        if (favorites.find((fav) => fav.id === item.id)) {
            setFavorites(favorites.filter((fav) => fav.id !== item.id));
        } else {
            setFavorites([...favorites, item]);
        }
    };

    const getTotal = () => {
        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        if (firstOrder) {
            let discount = total * 0.5;
            if (discount > 100) discount = 100;
            total -= discount;
        }
        return total;
    };

    const filteredMenu = menu.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPrice = item.price <= priceFilter;
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
        return matchesSearch && matchesPrice && matchesCategory;
    });

    const handlePlaceOrder = () => {
        if (cart.length === 0) {
            Alert.alert("Empty Cart", "Please add items to your cart");
            return;
        }
        if (!userProfile.savedAddresses.length) {
            Alert.alert("No Address", "Please add a delivery address first");
            return;
        }
        setShowPaymentModal(true);
    };

    const handlePayment = () => {
        setShowPaymentModal(false);
        setFirstOrder(false);
        const order = {
            id: Date.now(),
            items: cart,
            total: getTotal(),
            status: "confirming",
            date: new Date().toLocaleDateString(),
            paymentMethod: selectedPayment,
            deliveryAddress: userProfile.savedAddresses[0]
        };
        setOrderHistory([order, ...orderHistory]);
        Alert.alert(
            "Order Confirmed!",
            `Your order will arrive in 30 minutes\nTotal: ₹${getTotal()}\nPayment: ${selectedPayment.toUpperCase()}`
        );
        setCart([]);
        setTimeout(() => {
            setSelectedOrder(order);
            setOrderStatus("preparing");
            setShowOrderTracking(true);
        }, 1000);
    };

    const updateOrderStatus = () => {
        if (orderStatus === "preparing") setOrderStatus("out_for_delivery");
        else if (orderStatus === "out_for_delivery") setOrderStatus("delivered");
    };

    const handleReviewSubmit = () => {
        if (!reviewText) {
            Alert.alert("Empty Review", "Please write a review");
            return;
        }
        const itemReviews = reviews[selectedItemForReview.id] || [];
        reviews[selectedItemForReview.id] = [
            ...itemReviews,
            { rating, text: reviewText, user: userProfile.name, date: new Date().toLocaleDateString() }
        ];
        setReviews({ ...reviews });
        Alert.alert("Review Submitted", "Thank you for your feedback!");
        setShowReviewModal(false);
        setReviewText("");
        setRating(5);
    };

    const renderLoginScreen = () => (
        <ScrollView style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 20 }}>
            <Image source={require("./assets/logo.png")} style={{ width: 200, height: 200, alignSelf: "center", marginTop: 40 }} />
            <Text style={{ fontSize: 28, fontWeight: "bold", textAlign: "center", marginVertical: 20 }}>DosaHub</Text>
            <Text style={{ fontSize: 16, textAlign: "center", marginBottom: 30 }}>Login to Order Delicious Dosas</Text>
            <TextInput placeholder="Enter 10-digit Mobile Number" style={{ borderWidth: 2, borderColor: "#E64A19", padding: 15, marginBottom: 15, borderRadius: 10, fontSize: 16 }} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" maxLength={10} />
            <TouchableOpacity onPress={handleLoginWithMobile} style={{ backgroundColor: "#E64A19", padding: 15, borderRadius: 10, marginBottom: 20 }} disabled={verifyingOTP}>
                <Text style={{ color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "bold" }}> {verifyingOTP ? "Sending OTP..." : "Send OTP"} </Text>
            </TouchableOpacity>
            {verifyingOTP && (
                <View>
                    <TextInput placeholder="Enter OTP (Demo: 1234)" style={{ borderWidth: 2, borderColor: "#E64A19", padding: 15, marginBottom: 15, borderRadius: 10, fontSize: 16 }} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={4} />
                    <TouchableOpacity onPress={handleOTPVerification} style={{ backgroundColor: "#4CAF50", padding: 15, borderRadius: 10 }}>
                        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "bold" }}>Verify OTP</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );

    const renderHomeScreen = () => (
        <ScrollView style={{ backgroundColor: "#FFF8E1", paddingBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15 }}>
                <Text style={{ fontSize: 20, fontWeight: "bold" }}>Welcome, {userProfile.name}!</Text>
                <TouchableOpacity onPress={() => setScreen("profile")}>
                    <MaterialIcons name="account-circle" size={32} color="#E64A19" />
                </TouchableOpacity>
            </View>
            <Image source={require("./assets/cover.jpg")} style={{ width: "100%", height: 180 }} />
            <View style={{ padding: 15 }}>
                <TextInput placeholder="🔍 Search dishes..." style={{ borderWidth: 2, borderColor: "#E64A19", padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 14 }} value={searchQuery} onChangeText={setSearchQuery} />
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
                    <TouchableOpacity onPress={() => setCategoryFilter("all")} style={{ backgroundColor: categoryFilter === "all" ? "#E64A19" : "#fff", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E64A19" }}>
                        <Text style={{ color: categoryFilter === "all" ? "#fff" : "#E64A19", fontWeight: "bold" }}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setCategoryFilter("veg")} style={{ backgroundColor: categoryFilter === "veg" ? "#E64A19" : "#fff", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#E64A19" }}>
                        <Text style={{ color: categoryFilter === "veg" ? "#fff" : "#E64A19", fontWeight: "bold" }}>🥬 Veg</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ marginBottom: 15 }}>
                    <Text>Price Range: ₹{priceFilter}</Text>
                    <View style={{ height: 40, backgroundColor: "#E64A19", borderRadius: 10 }} />
                </View>
            </View>
            {filteredMenu.map((item) => (
                <TouchableOpacity key={item.id} style={{ backgroundColor: "#fff", padding: 15, margin: 10, borderRadius: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>{item.image} {item.name}</Text>
                        <Text>₹{item.price}</Text>
                        <Text>⭐ {item.rating}</Text>
                        <View style={{ flexDirection: "row", marginTop: 5 }}>
                            <TouchableOpacity onPress={() => { setSelectedItemForReview(item); setShowReviewModal(true); }} style={{ marginRight: 10 }}>
                                <Text style={{ color: "#E64A19" }}>📝 Review</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => toggleFavorite(item)}>
                                <Text>{favorites.find((fav) => fav.id === item.id) ? "❤️" : "🤍"}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ gap: 10 }}>
                        <TouchableOpacity onPress={() => addToCart(item)} style={{ backgroundColor: "#E64A19", padding: 10, borderRadius: 8 }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderProfileScreen = () => (
        <ScrollView style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 15 }}>
            <TouchableOpacity onPress={() => setScreen("home")} style={{ marginBottom: 20 }}>
                <MaterialIcons name="arrow-back" size={24} color="#E64A19" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>My Profile</Text>
            <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 14 }}>Name</Text>
                <TextInput style={{ borderWidth: 1, borderColor: "#E64A19", padding: 10, borderRadius: 5, marginBottom: 15 }} value={userProfile.name} onChangeText={(text) => setUserProfile({ ...userProfile, name: text })} />
                <Text style={{ fontSize: 14 }}>Email</Text>
                <TextInput style={{ borderWidth: 1, borderColor: "#E64A19", padding: 10, borderRadius: 5, marginBottom: 15 }} value={userProfile.email} onChangeText={(text) => setUserProfile({ ...userProfile, email: text })} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Saved Addresses</Text>
            <TouchableOpacity onPress={() => { const newAddress = `Address ${userProfile.savedAddresses.length + 1}`; setUserProfile({ ...userProfile, savedAddresses: [...userProfile.savedAddresses, newAddress] }); Alert.alert("Address Added", newAddress); }} style={{ backgroundColor: "#E64A19", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>+ Add New Address</Text>
            </TouchableOpacity>
            {userProfile.savedAddresses.map((addr, idx) => (
                <View key={idx} style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10 }}>
                    <Text>{addr}</Text>
                </View>
            ))}
            <TouchableOpacity onPress={() => setScreen("home")} style={{ backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, marginTop: 30 }}>
                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Back to Shopping</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    const renderCartScreen = () => (
        <ScrollView style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 15 }}>
            <TouchableOpacity onPress={() => setScreen("home")} style={{ marginBottom: 20 }}>
                <MaterialIcons name="arrow-back" size={24} color="#E64A19" />
            </TouchableOpacity>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>🛒 Your Cart</Text>
            {cart.length === 0 ? (
                <Text style={{ textAlign: "center", marginTop: 50, fontSize: 16 }}>Your cart is empty</Text>
            ) : (
                <View>
                    {cart.map((item) => (
                        <View key={item.id} style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontWeight: "bold" }}>{item.name}</Text>
                                <Text>₹{item.price} each</Text>
                            </View>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={{ backgroundColor: "#E64A19", width: 30, height: 30, borderRadius: 5, justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{ color: "#fff", fontSize: 16 }}>−</Text>
                                </TouchableOpacity>
                                <Text style={{ fontWeight: "bold", marginHorizontal: 10 }}>{item.quantity}</Text>
                                <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={{ backgroundColor: "#E64A19", width: 30, height: 30, borderRadius: 5, justifyContent: "center", alignItems: "center" }}>
                                    <Text style={{ color: "#fff", fontSize: 16 }}>+</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={{ marginLeft: 10 }}>
                                    <Text style={{ fontSize: 16 }}>🗑️</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginTop: 20 }}>
                        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Total: ₹{getTotal()}</Text>
                        {firstOrder && <Text style={{ color: "#4CAF50", fontWeight: "bold" }}>✓ 50% First Order Discount Applied!</Text>}
                    </View>
                    <TouchableOpacity onPress={handlePlaceOrder} style={{ backgroundColor: "#E64A19", padding: 15, borderRadius: 10, marginTop: 20 }}>
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>Proceed to Payment</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );

    return (
        <View style={{ flex: 1 }}>
            {screen === "login" && renderLoginScreen()}
            {screen === "home" && (
                <View style={{ flex: 1 }}>
                    {renderHomeScreen()}
                    <View style={{ flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#ddd" }}>
                        <TouchableOpacity onPress={() => setScreen("home")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>🏠</Text> </TouchableOpacity>
                        <TouchableOpacity onPress={() => setScreen("profile")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>👤</Text> </TouchableOpacity>
                        <TouchableOpacity onPress={() => setScreen("orders")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>📦</Text> </TouchableOpacity>
                        <TouchableOpacity onPress={() => setScreen("cart")} style={{ flex: 1, padding: 10, alignItems: "center", borderTopWidth: 2, borderColor: "#E64A19" }}> <Text style={{ fontSize: 24 }}>🛒 {cart.length}</Text> </TouchableOpacity>
                    </View>
                </View>
            )}
            {screen === "profile" && renderProfileScreen()}
            {screen === "cart" && (
                <View style={{ flex: 1 }}>
                    {renderCartScreen()}
                    <View style={{ flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#ddd" }}>
                        <TouchableOpacity onPress={() => setScreen("home")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>🏠</Text> </TouchableOpacity>
                        <TouchableOpacity onPress={() => setScreen("profile")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>👤</Text> </TouchableOpacity>
                        <TouchableOpacity onPress={() => setScreen("orders")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>📦</Text> </TouchableOpacity>
                        <TouchableOpacity onPress={() => setScreen("cart")} style={{ flex: 1, padding: 10, alignItems: "center", borderTopWidth: 2, borderColor: "#E64A19" }}> <Text style={{ fontSize: 24 }}>🛒 {cart.length}</Text> </TouchableOpacity>
                    </View>
                </View>
            )}
            {screen === "orders" && (
                <ScrollView style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 15 }}>
                    <TouchableOpacity onPress={() => setScreen("home")} style={{ marginBottom: 20 }}>
                        <MaterialIcons name="arrow-back" size={24} color="#E64A19" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>📦 Order History</Text>
                    {orderHistory.length === 0 ? (
                        <Text style={{ textAlign: "center", marginTop: 50 }}>No orders yet</Text>
                    ) : (
                        orderHistory.map((order) => (
                            <TouchableOpacity key={order.id} onPress={() => { setSelectedOrder(order); setShowOrderTracking(true); }} style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 10 }}> <Text style={{ fontWeight: "bold" }}>Order #{order.id}</Text> <Text>Date: {order.date}</Text> <Text>Total: ₹{order.total}</Text> <Text>Items: {order.items.length}</Text> <Text>Status: {order.status}</Text> </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            )}
            {screen === "orders" && (
                <View style={{ flexDirection: "row", backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#ddd" }}>
                    <TouchableOpacity onPress={() => setScreen("home")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>🏠</Text> </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScreen("profile")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>👤</Text> </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScreen("orders")} style={{ flex: 1, padding: 10, alignItems: "center", borderTopWidth: 2, borderColor: "#E64A19" }}> <Text style={{ fontSize: 24 }}>📦</Text> </TouchableOpacity>
                    <TouchableOpacity onPress={() => setScreen("cart")} style={{ flex: 1, padding: 10, alignItems: "center" }}> <Text style={{ fontSize: 24 }}>🛒 {cart.length}</Text> </TouchableOpacity>
                </View>
            )}
            <Modal visible={showPaymentModal} animationType="slide">
                <ScrollView style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 20 }}>
                    <TouchableOpacity onPress={() => setShowPaymentModal(false)} style={{ marginBottom: 20 }}>
                        <MaterialIcons name="close" size={24} color="#E64A19" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>💳 Select Payment Method</Text>
                    {["upi", "card", "netbanking", "wallet"].map((method) => (
                        <TouchableOpacity key={method} onPress={() => setSelectedPayment(method)} style={{ backgroundColor: selectedPayment === method ? "#E64A19" : "#fff", padding: 15, borderRadius: 10, marginBottom: 10, borderWidth: 2, borderColor: "#E64A19" }}>
                            <Text style={{ color: selectedPayment === method ? "#fff" : "#000", fontWeight: "bold" }}> {method === "upi" && "📱 UPI"} {method === "card" && "💳 Credit/Debit Card"} {method === "netbanking" && "🏦 Net Banking"} {method === "wallet" && "👛 Digital Wallet"} </Text>
                        </TouchableOpacity>
                    ))}
                    <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginVertical: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Order Summary</Text>
                        <Text style={{ marginTop: 10 }}>Items: {cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
                        <Text>Total: ₹{getTotal()}</Text>
                    </View>
                    <TouchableOpacity onPress={handlePayment} style={{ backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, marginBottom: 10 }}>
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 }}>Complete Payment</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowPaymentModal(false)} style={{ backgroundColor: "#999", padding: 15, borderRadius: 10 }}>
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
            <Modal visible={showOrderTracking} animationType="slide">
                <ScrollView style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 20 }}>
                    <TouchableOpacity onPress={() => setShowOrderTracking(false)} style={{ marginBottom: 20 }}>
                        <MaterialIcons name="close" size={24} color="#E64A19" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>📍 Order Tracking</Text>
                    {selectedOrder && (
                        <View>
                            <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                                <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Order #{selectedOrder.id}</Text>
                                <Text>Delivery Address: {selectedOrder.deliveryAddress}</Text>
                            </View>
                            <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>Status Updates</Text>
                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: orderStatus === "confirming" || orderStatus === "preparing" || orderStatus === "out_for_delivery" || orderStatus === "delivered" ? "#E64A19" : "#ddd", justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ color: "#fff", fontWeight: "bold" }}>✓</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 2, backgroundColor: "#E64A19", marginHorizontal: 10 }} />
                                    <Text style={{ fontWeight: "bold" }}>Order Confirmed</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: orderStatus === "preparing" || orderStatus === "out_for_delivery" || orderStatus === "delivered" ? "#E64A19" : "#ddd", justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ color: "#fff", fontWeight: "bold" }}>{orderStatus === "preparing" ? "..." : "✓"}</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 2, backgroundColor: "#E64A19", marginHorizontal: 10 }} />
                                    <Text style={{ fontWeight: "bold" }}>Preparing</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: orderStatus === "out_for_delivery" || orderStatus === "delivered" ? "#E64A19" : "#ddd", justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ color: "#fff", fontWeight: "bold" }}>{orderStatus === "out_for_delivery" ? "..." : orderStatus === "delivered" ? "✓" : ""}</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 2, backgroundColor: "#E64A19", marginHorizontal: 10 }} />
                                    <Text style={{ fontWeight: "bold" }}>Out for Delivery</Text>
                                </View>
                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: orderStatus === "delivered" ? "#E64A19" : "#ddd", justifyContent: "center", alignItems: "center" }}>
                                        <Text style={{ color: "#fff", fontWeight: "bold" }}>{orderStatus === "delivered" ? "✓" : ""}</Text>
                                    </View>
                                    <View style={{ flex: 1, height: 2, backgroundColor: "#ddd", marginHorizontal: 10 }} />
                                    <Text style={{ fontWeight: "bold" }}>Delivered</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={updateOrderStatus} style={{ backgroundColor: "#E64A19", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>📍 Update Status (Demo)</Text>
                            </TouchableOpacity>
                            <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                                <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Items:</Text>
                                {selectedOrder.items.map((item, idx) => (
                                    <Text key={idx}>{item.name} x{item.quantity} - ₹{item.price * item.quantity}</Text>
                                ))}
                                <Text style={{ fontWeight: "bold", marginTop: 10 }}>Total: ₹{selectedOrder.total}</Text>
                            </View>
                        </View>
                    )}
                    <TouchableOpacity onPress={() => setShowOrderTracking(false)} style={{ backgroundColor: "#999", padding: 15, borderRadius: 10 }}>
                        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Close</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
            <Modal visible={showReviewModal} animationType="slide">
                <ScrollView style={{ flex: 1, backgroundColor: "#FFF8E1", padding: 20 }}>
                    <TouchableOpacity onPress={() => setShowReviewModal(false)} style={{ marginBottom: 20 }}>
                        <MaterialIcons name="close" size={24} color="#E64A19" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>⭐ Rate & Review</Text>
                    {selectedItemForReview && (
                        <View>
                            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>{selectedItemForReview.image} {selectedItemForReview.name}</Text>
                            <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                                <Text style={{ marginBottom: 10 }}>Rating:</Text>
                                <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                                            <Text style={{ fontSize: 32 }}>{star <= rating ? "⭐" : "☆"}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput placeholder="Write your review..." multiline numberOfLines={4} style={{ borderWidth: 1, borderColor: "#E64A19", padding: 10, borderRadius: 5, marginBottom: 15 }} value={reviewText} onChangeText={setReviewText} />
                            </View>
                            <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginBottom: 20 }}>
                                <Text style={{ fontWeight: "bold", marginBottom: 10 }}>Other Reviews:</Text>
                                {reviews[selectedItemForReview.id] && reviews[selectedItemForReview.id].map((review, idx) => (
                                    <View key={idx} style={{ borderTopWidth: 1, borderColor: "#ddd", paddingTop: 10, marginTop: 10 }}>
                                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                            <Text style={{ fontWeight: "bold" }}>{review.user}</Text>
                                            <Text>{"⭐".repeat(review.rating)}</Text>
                                        </View>
                                        <Text style={{ marginTop: 5, color: "#666" }}>{review.text}</Text>
                                        <Text style={{ fontSize: 12, color: "#999", marginTop: 5 }}>{review.date}</Text>
                                    </View>
                                ))}
                            </View>
                            <TouchableOpacity onPress={handleReviewSubmit} style={{ backgroundColor: "#E64A19", padding: 15, borderRadius: 10, marginBottom: 10 }}>
                                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Submit Review</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)} style={{ backgroundColor: "#999", padding: 15, borderRadius: 10 }}>
                                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </Modal>
        </View>
    );
}