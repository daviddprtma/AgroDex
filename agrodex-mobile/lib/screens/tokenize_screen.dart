import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:go_router/go_router.dart';

class TokenizeScreen extends StatefulWidget {
  const TokenizeScreen({super.key});

  @override
  State<TokenizeScreen> createState() => _TokenizeScreenState();
}

class _TokenizeScreenState extends State<TokenizeScreen> {
  final _supabase = Supabase.instance.client;
  final _txIdsController = TextEditingController();
  bool _isDemoMode = true;
  bool _isLoading = false;

  @override
  void dispose() {
    _txIdsController.dispose();
    super.dispose();
  }

  Future<void> _handleTokenize() async {
    final rawIds = _txIdsController.text.trim();
    if (rawIds.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter at least one HCS Transaction ID')),
      );
      return;
    }

    final hcsTransactionIds = rawIds.split(RegExp(r'[\n,]')).map((id) => id.trim()).where((id) => id.isNotEmpty).toList();

    setState(() => _isLoading = true);

    try {
      final headers = <String, String>{};
      if (_isDemoMode) {
        headers['x-demo-mode'] = 'true';
      }

      final response = await _supabase.functions.invoke(
        'tokenize-batch',
        body: {'hcsTransactionIds': hcsTransactionIds},
        headers: headers,
      );

      if (!mounted) return;

      if (response.status == 200) {
        final data = response.data;
        _showSuccessDialog(data['tokenId'], data['serialNumber'], data['ai_summary']);
      } else {
        throw Exception(response.data?['error'] ?? 'Unknown error occurred');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Tokenization Failed: $e')),
      );
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSuccessDialog(String? tokenId, dynamic serialNumber, dynamic aiSummary) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            SizedBox(width: 8),
            Expanded(child: Text('Token Minted!')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Token ID: ${tokenId ?? 'N/A'}', style: const TextStyle(fontWeight: FontWeight.bold)),
            Text('Serial Number: ${serialNumber ?? 'N/A'}'),
            if (aiSummary != null && aiSummary['trustScore'] != null) ...[
              const Divider(),
              Text('Trust Score: ${aiSummary['trustScore']}/100', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(aiSummary['summary_en'] ?? ''),
            ]
          ],
        ),
        actions: [
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
        title: const Text('Tokenize Batch'),
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.generating_tokens, size: 64, color: Color(0xFF10B981)),
            const SizedBox(height: 16),
            const Text(
              'Generate AI Trust Report & Certificate',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Link HCS transaction IDs to generate an AI trust report and create a permanent NFT certificate.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey),
            ),
            const SizedBox(height: 32),
            TextField(
              controller: _txIdsController,
              decoration: const InputDecoration(
                labelText: 'HCS Transaction IDs',
                hintText: 'Comma or newline separated IDs',
                border: OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 5,
            ),
            const SizedBox(height: 16),
            CheckboxListTile(
              title: const Text('Use Demo Mode'),
              subtitle: const Text('No wallet required - guaranteed success for presentations'),
              value: _isDemoMode,
              onChanged: (val) => setState(() => _isDemoMode = val ?? true),
              contentPadding: EdgeInsets.zero,
              controlAffinity: ListTileControlAffinity.leading,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: _isLoading ? null : _handleTokenize,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF8B5CF6), // Violet color to match web
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
                  : const Text('Generate AI Report & Mint', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
