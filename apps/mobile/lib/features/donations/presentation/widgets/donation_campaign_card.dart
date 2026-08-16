import 'package:flutter/material.dart';
import '../../domain/entities/donation_campaign_entity.dart';
import '../../../../shared/theme/app_spacing.dart';
import '../../../../shared/theme/app_radius.dart';
import 'package:santmat_satsang_prachar/shared/widgets/ssp_image.dart';


class DonationCampaignCard extends StatelessWidget {
  final DonationCampaignEntity campaign;
  final VoidCallback onTap;

  const DonationCampaignCard({
    super.key,
    required this.campaign,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final progress = campaign.collectedAmount / campaign.goalAmount;

    return Card(
      margin: const EdgeInsets.only(bottom: AppSpacing.sp16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(AppRadius.md),
              ),
              child: SSPImage(
                campaign.bannerImage,
                height: 140,
                width: double.infinity,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(
                  height: 140,
                  width: double.infinity,
                  color: Colors.grey.shade300,
                  child: const Icon(Icons.image),
                ),
              ),
            ),
            Padding(
              padding: AppSpacing.p16,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    campaign.title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.sp4),
                  Text(
                    campaign.subtitle,
                    style: Theme.of(context).textTheme.bodySmall,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: AppSpacing.sp16),
                  LinearProgressIndicator(value: progress),
                  const SizedBox(height: AppSpacing.sp4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '${campaign.currency} ${campaign.collectedAmount.toStringAsFixed(0)} raised',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Goal: ${campaign.currency} ${campaign.goalAmount.toStringAsFixed(0)}',
                        style: Theme.of(
                          context,
                        ).textTheme.bodySmall?.copyWith(color: Colors.grey),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
