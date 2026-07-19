import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';
import { CreditCard, Loader } from 'lucide-react';

interface PaymentFormProps {
  factureId: number;
  montant: number;
  email: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ factureId, montant, email, onSuccess, onCancel }: PaymentFormProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  useEffect(() => {
    // Simuler le chargement
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !expiryDate || !cvc || !cardName) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      setProcessing(true);

      // Appel au backend pour créer l'intention de paiement
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factureId,
          montant,
          email,
          description: `Paiement facture #${factureId}`
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du paiement');
      }

      const data = await response.json();

      // Simuler la confirmation du paiement
      // En production: faire une vraie vérification 3D Secure avec Stripe
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Confirmer le paiement
      const confirmResponse = await fetch(`/api/payments/confirm/${data.clientSecret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (confirmResponse.ok) {
        toast.success('✅ Paiement réussi!');
        onSuccess?.();
      } else {
        throw new Error('Erreur lors de la confirmation du paiement');
      }
    } catch (err) {
      toast.error('❌ Erreur lors du paiement');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
        <p className="ml-3 text-gray-600">Chargement du formulaire de paiement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Paiement sécurisé</h2>
      </div>

      {/* Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Montant à payer:</span>
          <span className="font-bold text-lg">{(montant / 100).toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700">Email:</span>
          <span className="text-gray-900">{email}</span>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Carte de crédit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de carte
          </label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
            maxLength={16}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={processing}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Date d'expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date d'expiration
            </label>
            <input
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={(e) => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length >= 2) {
                  val = val.slice(0, 2) + '/' + val.slice(2, 4);
                }
                setExpiryDate(val);
              }}
              maxLength={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={processing}
            />
          </div>

          {/* CVC */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVC
            </label>
            <input
              type="text"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
              maxLength={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={processing}
            />
          </div>
        </div>

        {/* Nom du titulaire */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom du titulaire
          </label>
          <input
            type="text"
            placeholder="Jean Dupont"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={processing}
          />
        </div>

        {/* Message test */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          <p>🧪 <strong>Mode test Stripe</strong></p>
          <p className="mt-2">Utilisez la carte: <strong>4242 4242 4242 4242</strong></p>
          <p className="text-xs mt-1">Date: tout mois/année futur | CVC: n'importe quel 3 chiffres</p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={processing}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={processing}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {processing ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Traitement...
              </>
            ) : (
              <>
                💳 Payer {(montant / 100).toFixed(2)} €
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Sécurité */}
      <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-900">
        <p>🔒 <strong>Paiement sécurisé par Stripe</strong></p>
        <p className="mt-2 text-xs">Vos données de paiement sont chiffrées et sécurisées.</p>
      </div>
    </div>
  );
}
