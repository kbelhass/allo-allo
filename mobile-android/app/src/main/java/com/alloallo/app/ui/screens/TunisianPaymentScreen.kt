package com.alloallo.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

enum class TunisianPaymentMethod {
    D17_POSTE,
    FLOUSSI,
    RECHARGE_OOREDOO,
    RECHARGE_ORANGE,
    RECHARGE_TELECOM,
    SOBFLOUS
}

@Composable
fun TunisianPaymentScreen(
    currentCredits: Int,
    onPaymentSuccess: (amountTND: Double, creditsGained: Int) -> Unit
) {
    var selectedMethod by remember { mutableStateOf(TunisianPaymentMethod.D17_POSTE) }
    var phoneNumber by remember { mutableStateOf("") }
    var voucherCode by remember { mutableStateOf("") }
    var isProcessing by remember { mutableStateOf(false) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF090A0F))
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            // Bannière solde crédits
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF161A26))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Solde de crédits Allo-Allo", color = Color(0xFF94A3B8), fontSize = 13.sp)
                        Text("$currentCredits 🪙", color = Color(0xFFFBBF24), fontSize = 28.sp, fontWeight = FontWeight.Bold)
                    }
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = Color(0x33FBBF24)
                    ) {
                        Text(
                            "Tarifs en Dinars (TND)",
                            color = Color(0xFFFBBF24),
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }
        }

        item {
            Text("Choisissez un moyen de paiement tunisien", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        // Grille des méthodes de paiement
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                PaymentMethodRow(
                    title = "D17 (La Poste Tunisienne)",
                    subtitle = "Carte e-Dinar, mobile D17 ou code USSD *117#",
                    isSelected = selectedMethod == TunisianPaymentMethod.D17_POSTE,
                    onClick = { selectedMethod = TunisianPaymentMethod.D17_POSTE }
                )
                PaymentMethodRow(
                    title = "Recharge Ooredoo / Orange / TT",
                    subtitle = "Code de recharge à gratter (14 chiffres)",
                    isSelected = selectedMethod == TunisianPaymentMethod.RECHARGE_OOREDOO,
                    onClick = { selectedMethod = TunisianPaymentMethod.RECHARGE_OOREDOO }
                )
                PaymentMethodRow(
                    title = "Floussi Wallet & QR Code",
                    subtitle = "Paiement instantané par portefeuille électronique tunisien",
                    isSelected = selectedMethod == TunisianPaymentMethod.FLOUSSI,
                    onClick = { selectedMethod = TunisianPaymentMethod.FLOUSSI }
                )
            }
        }

        // Formulaire contextuel
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF131722)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (selectedMethod == TunisianPaymentMethod.D17_POSTE) {
                        Text("Paiement via D17 Poste", color = Color.White, fontWeight = FontWeight.SemiBold)
                        OutlinedTextField(
                            value = phoneNumber,
                            onValueChange = { phoneNumber = it },
                            label = { Text("Numéro mobile lié au compte D17") },
                            placeholder = { Text("Ex: 98 123 456 ou 22 987 654") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    } else if (selectedMethod == TunisianPaymentMethod.RECHARGE_OOREDOO) {
                        Text("Recharge par carte téléphonique", color = Color.White, fontWeight = FontWeight.SemiBold)
                        OutlinedTextField(
                            value = voucherCode,
                            onValueChange = { voucherCode = it },
                            label = { Text("Code de recharge (14 chiffres)") },
                            placeholder = { Text("Ex: 4829 1039 5820 12") },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    Button(
                        onClick = {
                            isProcessing = true
                            // Simule l'appel vers l'API backend Allo-Allo
                            onPaymentSuccess(9.990, 100)
                            isProcessing = false
                            successMessage = "Recharge validée ! 100 crédits ajoutés avec succès."
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE11D48)),
                        enabled = !isProcessing
                    ) {
                        Text(if (isProcessing) "Traitement sécurisé..." else "Valider le paiement (9.990 DT)")
                    }

                    if (successMessage != null) {
                        Text(successMessage!!, color = Color(0xFF34D399), fontSize = 13.sp)
                    }
                }
            }
        }
    }
}

@Composable
fun PaymentMethodRow(
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) Color(0xFFE11D48) else Color(0xFF1E2433),
                shape = RoundedCornerShape(12.dp)
            ),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = if (isSelected) Color(0xFF1F1722) else Color(0xFF11141D))
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(title, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                Text(subtitle, color = Color(0xFF94A3B8), fontSize = 12.sp)
            }
            if (isSelected) {
                Icon(Icons.Default.Check, contentDescription = "Sélectionné", tint = Color(0xFFE11D48))
            }
        }
    }
}
