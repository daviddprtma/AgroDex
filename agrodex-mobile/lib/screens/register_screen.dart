import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _supabase = Supabase.instance.client;
  
  final _productNameController = TextEditingController();
  final _harvestBatchController = TextEditingController();
  final _quantityController = TextEditingController();
  final _unitController = TextEditingController();
  final _locationController = TextEditingController();
  final _metadataController = TextEditingController();
  
  DateTime? _selectedDate;
  bool _isLoading = false;

  @override
  void dispose() {
    _productNameController.dispose();
    _harvestBatchController.dispose();
    _quantityController.dispose();
    _unitController.dispose();
    _locationController.dispose();
    _metadataController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF10B981), // Emerald
              onPrimary: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _handleRegister() async {
    if (_productNameController.text.isEmpty ||
        _harvestBatchController.text.isEmpty ||
        _quantityController.text.isEmpty ||
        _unitController.text.isEmpty ||
        _locationController.text.isEmpty ||
        _selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill out all required fields.')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      
      final body = {
        'productType': _productNameController.text.trim(),
        'quantity': _quantityController.text.trim(),
        'location': _locationController.text.trim(),
        'imageData': '', // Empty for now as per web
        'harvestDate': dateStr,
      };

      final response = await _supabase.functions.invoke(
        'register-batch',
        body: body,
      );

      if (!mounted) return;

      if (response.status == 200) {
        final data = response.data;
        _showSuccessDialog(data['batchId'], data['hcsTransactionId']);
      } else {
        throw Exception(response.data?['error'] ?? response.data?['details'] ?? 'Unknown error occurred');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Registration Failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSuccessDialog(String? batchId, String? txId) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Expanded(child: Text('Batch Registered!')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Your proof is saved permanently on Hedera.', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 16),
            const Text('Batch ID:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text(batchId ?? 'N/A', style: const TextStyle(fontFamily: 'monospace')),
            const SizedBox(height: 8),
            const Text('Transaction ID:', style: TextStyle(fontWeight: FontWeight.bold)),
            Text(txId ?? 'N/A', style: const TextStyle(fontFamily: 'monospace')),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.go('/tokenize'); // Proceed to tokenize
            },
            child: const Text('Proceed to Tokenize', style: TextStyle(color: Color(0xFF10B981))),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              context.pop(); // Go back to dashboard
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register Batch'),
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.inventory, size: 48, color: Color(0xFF10B981)),
            const SizedBox(height: 16),
            const Text(
              'Batch Information',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'All data will be permanently recorded on Hedera Consensus Service',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 24),
            
            TextField(
              controller: _productNameController,
              decoration: const InputDecoration(
                labelText: 'Product Name',
                hintText: 'e.g., Organic Arabica Coffee',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.local_florist),
              ),
            ),
            const SizedBox(height: 16),
            
            TextField(
              controller: _harvestBatchController,
              decoration: const InputDecoration(
                labelText: 'Harvest Batch Identifier',
                hintText: 'e.g., Batch #150',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.tag),
              ),
            ),
            const SizedBox(height: 16),
            
            Row(
              children: [
                Expanded(
                  flex: 2,
                  child: TextField(
                    controller: _quantityController,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'Quantity',
                      hintText: '1000',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.numbers),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 1,
                  child: TextField(
                    controller: _unitController,
                    decoration: const InputDecoration(
                      labelText: 'Unit',
                      hintText: 'kg',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            TextField(
              controller: _locationController,
              decoration: const InputDecoration(
                labelText: 'Origin Location',
                hintText: 'e.g., Kigali Region, Rwanda',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.location_on),
              ),
            ),
            const SizedBox(height: 16),
            
            InkWell(
              onTap: () => _selectDate(context),
              child: InputDecorator(
                decoration: const InputDecoration(
                  labelText: 'Harvest Date',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.calendar_today),
                ),
                child: Text(
                  _selectedDate == null 
                    ? 'Select Date' 
                    : DateFormat('yyyy-MM-dd').format(_selectedDate!),
                ),
              ),
            ),
            const SizedBox(height: 16),

            TextField(
              controller: _metadataController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: 'Additional Metadata (Optional)',
                hintText: 'e.g., Certified Fair Trade...',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.description),
              ),
            ),
            
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleRegister,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF10B981),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: _isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Register Batch', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
