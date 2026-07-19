import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/Button';
import { paymentsApi } from '../api/payments';
import { CreditCard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

interface PaymentFormProps {
  /** Id de la PaymentIntent Stripe (préfixe du clientSecret), pour la re-vérification. */
  intentId: string;
  /** Montant à payer en euros (pour l'affichage du bouton). */
  montant: number;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Formulaire de paiement Stripe Elements.
 *
 * Ce composant DOIT être rendu à l'intérieur d'un <Elements> (fournisseur
 * Stripe) qui porte le clientSecret. Le <PaymentElement> est un champ hébergé
 * par Stripe : les numéros de carte sont saisis dans une iframe Stripe et ne
 * transitent JAMAIS par notre serveur (conformité PCI). La confirmation se fait
 * directement auprès de Stripe via stripe.confirmPayment.
 */
export function PaymentForm({ intentId, montant, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      // redirect: 'if_required' => on reste sur la page pour les cartes classiques,
      // et Stripe ne redirige que si le moyen de paiement l'exige (ex: 3D Secure).
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Le paiement a été refusé.');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Filet de sécurité : on demande au backend de re-vérifier le statut
      // auprès de Stripe et de marquer la facture payée (au cas où le webhook
      // n'aurait pas encore été traité).
      try {
        await paymentsApi.sync(intentId);
      } catch {
        /* le webhook prendra le relais */
      }
      toast.success('✅ Paiement réussi !');
      onSuccess();
      return;
    }

    setError('Le paiement n\'a pas pu être finalisé. Réessayez.');
    setProcessing(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Paiement sécurisé</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <PaymentElement />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">{error}</div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          <p>🧪 <strong>Mode test Stripe</strong></p>
          <p className="mt-1">
            Carte de test : <strong>4242 4242 4242 4242</strong> — date future, tout CVC, tout code postal.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={onCancel} variant="outline" disabled={processing} className="flex-1">
            Annuler
          </Button>
          <Button type="submit" disabled={processing || !stripe} className="flex-1 bg-blue-600 hover:bg-blue-700">
            {processing ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Traitement…
              </>
            ) : (
              <>💳 Payer {montant.toFixed(2)} €</>
            )}
          </Button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded text-sm text-green-900">
        <p>🔒 <strong>Paiement sécurisé par Stripe</strong></p>
        <p className="mt-1 text-xs">Vos données de carte sont chiffrées et ne transitent pas par nos serveurs.</p>
      </div>
    </div>
  );
}
