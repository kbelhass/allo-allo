package com.alloallo.app.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

data class AlloUserProfile(
    val id: String,
    val name: String,
    val age: Int,
    val city: String,
    val country: String,
    val originCity: String?,
    val status: String, // "diaspora", "local", "foreigner"
    val bio: String,
    val photoUrl: String,
    val isVerified: Boolean,
    val interests: List<String>
)

@Composable
fun SwipeScreen(
    profiles: List<AlloUserProfile>,
    onSwipeRight: (AlloUserProfile) -> Unit,
    onSwipeLeft: (AlloUserProfile) -> Unit,
    onSuperLike: (AlloUserProfile) -> Unit
) {
    var currentIndex by remember { mutableIntStateOf(0) }
    val coroutineScope = rememberCoroutineScope()
    val offsetX = remember { Animatable(0f) }
    val offsetY = remember { Animatable(0f) }

    val currentProfile = profiles.getOrNull(currentIndex)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090A0F))
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        if (currentProfile != null) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .fillMaxHeight(0.82f)
                    .offset { IntOffset(offsetX.value.roundToInt(), offsetY.value.roundToInt()) }
                    .graphicsLayer {
                        rotationZ = (offsetX.value / 60).coerceIn(-15f, 15f)
                    }
                    .pointerInput(currentProfile.id) {
                        detectDragGestures(
                            onDragEnd = {
                                coroutineScope.launch {
                                    if (offsetX.value > 300f) {
                                        offsetX.animateTo(1200f, tween(250))
                                        onSwipeRight(currentProfile)
                                        currentIndex++
                                        offsetX.snapTo(0f)
                                        offsetY.snapTo(0f)
                                    } else if (offsetX.value < -300f) {
                                        offsetX.animateTo(-1200f, tween(250))
                                        onSwipeLeft(currentProfile)
                                        currentIndex++
                                        offsetX.snapTo(0f)
                                        offsetY.snapTo(0f)
                                    } else {
                                        offsetX.animateTo(0f, tween(200))
                                        offsetY.animateTo(0f, tween(200))
                                    }
                                }
                            },
                            onDrag = { change, dragAmount ->
                                change.consume()
                                coroutineScope.launch {
                                    offsetX.snapTo(offsetX.value + dragAmount.x)
                                    offsetY.snapTo(offsetY.value + dragAmount.y)
                                }
                            }
                        )
                    },
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF141721))
            ) {
                Box(modifier = Modifier.fillMaxSize()) {
                    AsyncImage(
                        model = currentProfile.photoUrl,
                        contentDescription = currentProfile.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )

                    // Gradient overlay pour lisibilité
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.verticalGradient(
                                    colors = listOf(Color.Transparent, Color(0xCC000000), Color(0xF2090A0F)),
                                    startY = 400f
                                )
                            )
                    )

                    // Informations profil
                    Column(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(20.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "${currentProfile.name}, ${currentProfile.age}",
                                fontSize = 26.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            if (currentProfile.isVerified) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Surface(
                                    shape = CircleShape,
                                    color = Color(0xFF38BDF8),
                                    modifier = Modifier.size(20.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Vérifié",
                                        tint = Color.White,
                                        modifier = Modifier.padding(2.dp)
                                    )
                                }
                            }
                        }

                        // Badge Statut (Diaspora / Local)
                        Spacer(modifier = Modifier.height(6.dp))
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = when (currentProfile.status) {
                                "diaspora" -> Color(0xFFE11D48)
                                "local" -> Color(0xFF059669)
                                else -> Color(0xFF7C3AED)
                            }
                        ) {
                            Text(
                                text = when (currentProfile.status) {
                                    "diaspora" -> "🇹🇳 Diaspora • ${currentProfile.city}, ${currentProfile.country}"
                                    "local" -> "📍 En Tunisie • ${currentProfile.city}"
                                    else -> "🌍 Étranger passionné de Tunisie"
                                },
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = currentProfile.bio,
                            color = Color(0xFFCBD5E1),
                            fontSize = 14.sp,
                            maxLines = 2
                        )

                        Spacer(modifier = Modifier.height(10.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            currentProfile.interests.take(3).forEach { interest ->
                                SuggestionChip(
                                    onClick = {},
                                    label = { Text(interest, fontSize = 11.sp, color = Color.White) },
                                    colors = SuggestionChipDefaults.suggestionChipColors(containerColor = Color(0x33FFFFFF))
                                )
                            }
                        }
                    }
                }
            }

            // Boutons d'action rapides en bas
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 12.dp)
                    .fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                FloatingActionButton(
                    onClick = {
                        coroutineScope.launch {
                            offsetX.animateTo(-1200f, tween(250))
                            onSwipeLeft(currentProfile)
                            currentIndex++
                            offsetX.snapTo(0f)
                            offsetY.snapTo(0f)
                        }
                    },
                    containerColor = Color(0xFF1E2230),
                    contentColor = Color(0xFFEF4444),
                    shape = CircleShape,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(Icons.Default.Close, contentDescription = "Passer")
                }

                FloatingActionButton(
                    onClick = {
                        coroutineScope.launch {
                            offsetY.animateTo(-1000f, tween(250))
                            onSuperLike(currentProfile)
                            currentIndex++
                            offsetX.snapTo(0f)
                            offsetY.snapTo(0f)
                        }
                    },
                    containerColor = Color(0xFF1E2230),
                    contentColor = Color(0xFF38BDF8),
                    shape = CircleShape,
                    modifier = Modifier.size(50.dp)
                ) {
                    Icon(Icons.Default.Star, contentDescription = "Super Like")
                }

                FloatingActionButton(
                    onClick = {
                        coroutineScope.launch {
                            offsetX.animateTo(1200f, tween(250))
                            onSwipeRight(currentProfile)
                            currentIndex++
                            offsetX.snapTo(0f)
                            offsetY.snapTo(0f)
                        }
                    },
                    containerColor = Color(0xFFE11D48),
                    contentColor = Color.White,
                    shape = CircleShape,
                    modifier = Modifier.size(64.dp)
                ) {
                    Text("❤️", fontSize = 24.sp)
                }
            }
        } else {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Plus de profils pour le moment !",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Élargissez vos filtres (diaspora ou locaux)",
                    color = Color(0xFF94A3B8),
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = { currentIndex = 0 },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48))
                ) {
                    Text("Réinitialiser les profils")
                }
            }
        }
    }
}
